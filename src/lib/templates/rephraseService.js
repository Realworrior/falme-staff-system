import { GoogleGenAI } from '@google/genai';
import { maskEntities, validateAndCleanOutput } from './entityMasker';

const TONE_MAP = {
  standard:     { label: 'Standard',     desc: 'Neutral, clear, and professional.' },
  high_empathy: { label: 'High Empathy', desc: 'Warm, reassuring, and deeply validating.' },
  firm:         { label: 'Firm',         desc: 'Calm, assertive, unambiguous, and non-negotiable.' },
  friendly:     { label: 'Friendly',     desc: 'Relaxed, upbeat, conversational, and approachable.' },
  formal:       { label: 'Formal',       desc: 'Polished, authoritative, respectful, and precise.' },
  reassuring:   { label: 'Reassuring',   desc: 'Steady, confidence-building, calm, and soothing.' },
  direct:       { label: 'Direct',       desc: 'Punchy, concise, action-first, and to-the-point.' },
};

// Fast production models — ordered by speed preference
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
];

function cleanErrorMessage(err) {
  if (!err) return 'An unexpected error occurred.';
  const msg = typeof err === 'string' ? err : err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) return parsed.error.message;
  } catch { /* not JSON */ }
  return msg;
}

/**
 * Extracts a JSON object from model output that may include markdown fences,
 * prose before/after the object, or other noise.
 */
function extractJSON(raw) {
  if (!raw) return null;

  // Try direct parse first
  try { return JSON.parse(raw.trim()); } catch { /* continue */ }

  // Strip markdown code fences
  const stripped = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
  try { return JSON.parse(stripped); } catch { /* continue */ }

  // Extract first {...} block from the response
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* continue */ }
  }

  return null;
}

/**
 * Offline fallback — fires only when ALL Gemini API calls fail.
 * Produces three genuinely distinct styles.
 */
function generateInstantFallback(baseText) {
  const clean = baseText.trim();

  // Standard: paraphrase with common phrase-level rewriting
  const standard = clean
    .replace(/please note that\s*/gi, '')
    .replace(/kindly\s+/gi, '')
    .replace(/we are sorry to hear that\s*/gi, 'We understand ')
    .replace(/we would like to inform you that\s*/gi, '')
    .replace(/feel free to/gi, 'you can')
    .replace(/we are pleased to inform you that\s*/gi, '')
    .replace(/at this (point|time)\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Lively: inject context-specific emojis inline where words naturally sit
  const lively = clean
    .replace(/\b(deposit(?:s|ed)?)\b/gi, '💳 $1')
    .replace(/\b(withdraw(?:al|als|n)?)\b/gi, '💸 $1')
    .replace(/\b(m-?pesa)\b/gi, '📲 $1')
    .replace(/\b(account)\b/gi, '🔐 $1')
    .replace(/\b(bet|bets|betting)\b/gi, '🎯 $1')
    .replace(/\b(review(?:ed)?|confirm(?:ed)?|verified)\b/gi, '🔍 $1')
    .replace(/\b(transaction(?:s)?)\b/gi, '🧾 $1')
    .replace(/\b(team)\b/gi, '👥 $1')
    .replace(/\b(check|verify)\b/gi, '✔️ $1')
    .trim();

  // Short: strip all filler, compress to arrow-chained core steps ONLY
  const fillerRx = /\b(please note that|kindly note that|we would like to inform you that|we are pleased to inform you that?|as per our records,?|for your information,?|we are sorry to hear (that|about)|we understand your concern,?|feel free to contact us)\b/gi;
  const compressed = clean
    .replace(fillerRx, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Split into sentences and join with arrows — do NOT prepend the original
  const sentences = compressed
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/[.!?]+$/, '').trim())
    .filter(Boolean);

  const short = sentences.length > 1
    ? sentences.join(' → ')
    : compressed.replace(/[.!?]+$/, '').trim();

  return { standard, lively, short };
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(r => { clearTimeout(t); resolve(r); }).catch(e => { clearTimeout(t); reject(e); });
  });
}

// ─── API Key Management ────────────────────────────────────────────────────────

export function getApiKeys() {
  const keys = [];
  const primary      = import.meta.env.VITE_GEMINI_API_KEY_PRIMARY;
  const secondary    = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;
  const userOverride = localStorage.getItem('betfalme_gemini_api_key');
  const legacyKey    = import.meta.env.VITE_GEMINI_API_KEY;

  if (userOverride && userOverride.trim()) keys.push({ name: 'Custom',    key: userOverride.trim() });
  if (primary     && primary.trim())       keys.push({ name: 'Primary',   key: primary.trim() });
  if (secondary   && secondary.trim())     keys.push({ name: 'Secondary', key: secondary.trim() });
  if (legacyKey   && legacyKey.trim())     keys.push({ name: 'Default',   key: legacyKey.trim() });
  return keys;
}

export function getStoredApiKey() {
  const keys = getApiKeys();
  return keys.length > 0 ? keys[0].key : '';
}

export function setStoredApiKey(key) {
  if (key) localStorage.setItem('betfalme_gemini_api_key', key.trim());
  else     localStorage.removeItem('betfalme_gemini_api_key');
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildPrompt({ baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] }) {
  const tone = TONE_MAP[toneId] || TONE_MAP.standard;

  let p = `You are a customer support writing assistant for Betfalme, a Kenyan sports betting platform.\n\n`;
  p += `TASK: Rewrite the agent message below into exactly THREE distinct versions.\n\n`;

  if (categoryTitle)   p += `Category: ${categoryTitle}\n`;
  if (subsectionTitle) p += `Topic: ${subsectionTitle}\n`;
  p += `Tone: ${tone.label} — ${tone.desc}\n\n`;

  p += `SOURCE MESSAGE:\n"""\n${baseText.trim()}\n"""\n\n`;

  p += `RULES (apply strictly):\n`;
  p += `- ABSOLUTE DATA FIDELITY: Never change, add, or remove any numbers, URLs, phone numbers, M-PESA codes, amounts, or time values. They must appear verbatim.\n`;
  p += `- No invented names, IDs, or commitments not in the source.\n`;
  p += `- All outputs: single continuous line, no line breaks, no bullet points.\n\n`;

  p += `VERSION RULES:\n`;
  p += `1. "standard" — A natural human paraphrase. Completely rewrite sentence structure and vocabulary. Sound like a sharp editor, not a synonym-swapper. NO emojis, NO symbols.\n`;
  p += `2. "lively" — High-energy version. Integrate emojis that are contextually specific to the NOUNS and ACTIONS in this exact message (e.g. 💳 near deposit, 📲 near M-PESA, 🎯 near bet, 🔐 near account, 💸 near withdrawal, 🧾 near transaction, ⏱️ near time). Emojis must sit next to their matching word. NO generic filler emojis. Single unbroken line.\n`;
  p += `3. "short" — Strip ALL pleasantries ("Please note that", "We would like to inform you", "We are sorry", "Feel free to", etc.). Keep ONLY the core facts and actions. Use → to separate distinct steps (no line breaks). Must be noticeably shorter than standard.\n\n`;

  if (avoidHistory.length > 0) {
    p += `FRESHNESS: Do NOT reuse phrasing from these previous outputs:\n`;
    avoidHistory.slice(0, 3).forEach((t, i) => { p += `  Previous ${i + 1}: "${t}"\n`; });
    p += `\n`;
  }

  p += `Respond ONLY with a raw JSON object (no markdown, no explanation, no code fences):\n`;
  p += `{"standard": "...", "lively": "...", "short": "..."}\n`;

  return p;
}

// ─── Core Execution ────────────────────────────────────────────────────────────

async function callGemini({ key, model, prompt, timeoutMs }) {
  const ai = new GoogleGenAI({ apiKey: key });

  const apiCall = ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      // No responseMimeType — we parse JSON manually for maximum compatibility
      // across all model versions. Temperature 0.7 = creative but reliable JSON.
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const response = await withTimeout(apiCall, timeoutMs);
  return response.text || '';
}

/**
 * Generates all three rephrase variants (standard, lively, short) via Gemini.
 */
export async function executeRephrase(options) {
  const { baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] } = options;
  const { maskedText, slotMap } = maskEntities(baseText);

  const prompt = buildPrompt({ baseText: maskedText, toneId, categoryTitle, subsectionTitle, avoidHistory });
  const availableKeys = getApiKeys();

  for (const { name: keyName, key } of availableKeys) {
    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[Gemini] ${keyName} / ${model}...`);
        const rawText = await callGemini({ key, model, prompt, timeoutMs: 20000 });
        console.log(`[Gemini] Raw response:`, rawText?.slice(0, 200));

        const parsed = extractJSON(rawText);
        if (!parsed) {
          console.warn(`[Gemini] ${model}: could not extract JSON from response`);
          continue;
        }

        const standardClean = validateAndCleanOutput(parsed.standard || '', slotMap);
        const livelyClean   = validateAndCleanOutput(parsed.lively   || '', slotMap);
        const shortClean    = validateAndCleanOutput(parsed.short    || '', slotMap);

        if (standardClean && livelyClean && shortClean) {
          console.log(`[Gemini] ✅ Success — ${keyName} / ${model}`);
          return { standard: standardClean, lively: livelyClean, short: shortClean, fromCache: false, keyUsed: keyName };
        }
        console.warn(`[Gemini] ${model}: fields missing after validation`, { standardClean, livelyClean, shortClean });
      } catch (err) {
        console.warn(`[Gemini] ${keyName} / ${model} failed:`, cleanErrorMessage(err));
      }
    }
  }

  console.warn('[Gemini] All routes failed — using heuristic fallback');
  return { ...generateInstantFallback(baseText), fromCache: false, keyUsed: 'Offline' };
}

/**
 * Regenerates a single variant type via Gemini.
 */
export async function executeSingleRephrase(type, options) {
  const { baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] } = options;
  const { maskedText, slotMap } = maskEntities(baseText);
  const prompt = buildPrompt({ baseText: maskedText, toneId, categoryTitle, subsectionTitle, avoidHistory });
  const availableKeys = getApiKeys();

  for (const { name: keyName, key } of availableKeys) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const rawText = await callGemini({ key, model, prompt, timeoutMs: 20000 });
        const parsed  = extractJSON(rawText);
        if (!parsed) continue;
        const cleaned = validateAndCleanOutput(parsed[type] || '', slotMap);
        if (cleaned) return cleaned;
      } catch (err) {
        console.warn(`[Gemini Single] ${keyName} / ${model}:`, cleanErrorMessage(err));
      }
    }
  }

  return generateInstantFallback(baseText)[type] || baseText;
}
