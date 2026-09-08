import { GoogleGenAI } from '@google/genai';
import { maskEntities, validateAndCleanOutput } from './entityMasker';
import { clientCache } from './cache';

const TONE_MAP = {
  standard:     { label: 'Standard',     desc: 'Neutral, clear, and professional.' },
  high_empathy: { label: 'High Empathy', desc: 'Warm, reassuring, and deeply validating.' },
  firm:         { label: 'Firm',         desc: 'Calm, assertive, unambiguous, and non-negotiable.' },
  friendly:     { label: 'Friendly',     desc: 'Relaxed, upbeat, conversational, and approachable.' },
  formal:       { label: 'Formal',       desc: 'Polished, authoritative, respectful, and precise.' },
  reassuring:   { label: 'Reassuring',   desc: 'Steady, confidence-building, calm, and soothing.' },
  direct:       { label: 'Direct',       desc: 'Punchy, concise, action-first, and to-the-point.' },
};

// (Guardrails are now embedded directly in SYSTEM_INSTRUCTION below)

// Officially supported & active Gemini API model identifiers (fastest first)
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

function cleanErrorMessage(err) {
  if (!err) return 'An unexpected error occurred.';
  const msg = typeof err === 'string' ? err : err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) return parsed.error.message;
  } catch { /* Not JSON */ }
  return msg;
}

function cleanShortOutput(shortRaw, slotMap) {
  if (Array.isArray(shortRaw)) {
    return shortRaw
      .map(item => validateAndCleanOutput(typeof item === 'string' ? item : JSON.stringify(item), slotMap))
      .map(item => item.replace(/^[•\-\d.]+\s*/, '').trim())
      .filter(Boolean);
  }
  if (typeof shortRaw === 'string') {
    const cleaned = validateAndCleanOutput(shortRaw, slotMap);
    if (!cleaned) return [];
    // Split by arrows or sentence boundaries if returned as a single string
    const parts = cleaned
      .split(/\s*→\s*|\n+|(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map(s => s.replace(/^[•\-\d.]+\s*/, '').trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [cleaned];
  }
  return [];
}

/**
 * Emergency offline fallback — only fires when ALL Gemini API calls fail.
 * Decomposes text into standalone actionable thoughts for Short.
 */
function generateInstantFallback(baseText) {
  const clean = baseText.trim();

  // Standard: minimal phrase-level rewrite to avoid returning raw source
  const standard = clean
    .replace(/please note that/gi, 'Be advised —')
    .replace(/kindly/gi, 'Please')
    .replace(/we are sorry/gi, 'We apologise')
    .replace(/feel free to/gi, 'do not hesitate to')
    .replace(/we would like to inform you/gi, 'We want you to know')
    .trim();

  // Lively: minimal context enrichment
  const lively = clean
    .replace(/deposit/gi, '💳 deposit')
    .replace(/withdraw/gi, '💸 withdraw')
    .replace(/mpesa|m-pesa/gi, '📲 M-PESA')
    .replace(/bet/gi, '🎯 bet')
    .replace(/account/gi, '🔐 account')
    .replace(/send|share/gi, '📤 send')
    .trim();

  // Short: Extract distinct standalone ideas/sentences, strip all filler
  const fillerRx = /\b(please note that|kindly note that|we would like to inform you that|we are pleased to inform you|as per our records|for your information|we are sorry to hear that|we understand your concern|feel free to contact us)\b/gi;
  const compressed = clean
    .replace(fillerRx, '')
    .replace(/we are sorry to hear (that|about)\s*/gi, '')
    .replace(/we understand (your concern|that you|how)\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const parts = compressed
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  const short = parts.length > 0 ? parts : [compressed];

  return { standard, lively, short };
}

/**
 * Executes a promise with a timeout. 15 seconds is generous enough for
 * Gemini Flash to respond without hanging the UI indefinitely.
 */
function withTimeout(promise, ms = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Request timed out after ${ms}ms`)),
      ms
    );
    promise
      .then(res => { clearTimeout(timer); resolve(res); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

/**
 * Returns ordered list of API keys:
 * 1. User localStorage override
 * 2. Primary env key
 * 3. Secondary env key (Fallback)
 * 4. Legacy env key
 */
export function getApiKeys() {
  const keys = [];
  const primary      = import.meta.env.VITE_GEMINI_API_KEY_PRIMARY;
  const secondary    = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;
  const userOverride = localStorage.getItem('betfalme_gemini_api_key');
  const legacyKey    = import.meta.env.VITE_GEMINI_API_KEY;

  if (userOverride && userOverride.trim()) keys.push({ name: 'Custom Override', key: userOverride.trim() });
  if (primary     && primary.trim())       keys.push({ name: 'Primary',         key: primary.trim() });
  if (secondary   && secondary.trim())     keys.push({ name: 'Secondary',       key: secondary.trim() });
  if (legacyKey   && legacyKey.trim())     keys.push({ name: 'Default',         key: legacyKey.trim() });

  return keys;
}

export function getStoredApiKey() {
  const keys = getApiKeys();
  return keys.length > 0 ? keys[0].key : '';
}

export function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem('betfalme_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('betfalme_gemini_api_key');
  }
}

const SYSTEM_INSTRUCTION = `[System Role]
You are a high-speed, zero-hallucination linguistic transformation engine built exclusively for the Betfalme betting platform customer support layer. You operate with absolute, flawless fidelity to the provided source text.

[Core Operations & Safety Guardrails]
- Absolute Data Fidelity: You are strictly forbidden from inventing, altering, adding, or removing any numeric thresholds, currencies, timeframes, examples (like M-PESA codes), phone numbers, or platform URLs. All factual data points present in the source MUST appear verbatim in every output variant.
- Category Isolation: Do not extrapolate or bleed logic across customer domains. Treat the provided text as a closed context loop. Do not inject customer names, transaction IDs, or speculative placeholders.
- No Filler Additions: Do not append generic sign-off phrases, live support links, or filler contact invitations unless they are already present in the source text.

[Variant Generation Rules]
You must process the provided input text into exactly three distinct output fields:

1. Standard:
- Provide a fluid, direct, and completely natural human paraphrase of the source.
- Fully restructure the sentence architecture to make it sound like a sharp human editor rewriting a draft, avoiding robotic synonym-swapping or corporate clichés.
- Format as continuous prose with no line breaks, emojis, or bullet points.

2. Lively:
- Infuse the message with high conversational energy and authentic enthusiasm that matches the underlying context.
- Dynamically integrate context-specific emojis directly tied to the unique subject matter, nouns, or actions present in the text (e.g. 💳 for deposits, 📲 for M-PESA, 🎯 for bets, 📤 for sharing, 🔐 for accounts, 💸 for withdrawals, ⏱️ for time, 📸 for screenshots).
- Strictly ban generic, rigid default emojis (such as 👋 or ✅) unless they are explicitly literal to the topic.
- Format as continuous prose with no line breaks.

3. Short:
- Decompose and extract ALL standalone ideas, core instruction steps, critical cautions/rules (e.g. 48-hour cooling period, batch withdrawal notes), and independent thoughts into an ARRAY of discrete standalone sentences.
- Each item in the array MUST be a complete, self-contained, fully actionable statement that an agent can copy and send by itself.
- Strip ALL pleasantries and filler ("Please note that", "Kindly note", "We would like to inform you", "We understand your concern", "We are sorry to hear", "Feel free to", etc.).
- Keep each standalone sentence concise, sharp, and direct.
- Return "short" as a JSON array of strings: ["Standalone idea/step 1", "Standalone warning/note 2", ...]

You MUST respond strictly with a valid JSON object matching this schema (no markdown code fences, no extra text outside the JSON):
{
  "standard": "string",
  "lively": "string",
  "short": [
    "string"
  ]
}`;

function buildPrompt({ baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] }) {
  const tone = TONE_MAP[toneId] || TONE_MAP.standard;
  let prompt = '';
  if (categoryTitle)   prompt += `Support Category: ${categoryTitle}\n`;
  if (subsectionTitle) prompt += `Topic / Sub-section: ${subsectionTitle}\n`;
  prompt += `Selected Agent Tone: ${tone.label} — ${tone.desc}\n`;
  prompt += `\n[Source Text — Agent Base Message]\n"""\n${baseText.trim()}\n"""\n`;

  if (avoidHistory && avoidHistory.length > 0) {
    prompt += `\n[Freshness Constraint — Avoid These Previously Generated Variants]\n`;
    avoidHistory.forEach((t, i) => { prompt += `Variant ${i + 1}: """${typeof t === 'string' ? t : JSON.stringify(t)}"""\n`; });
    prompt += `All new outputs must have distinct vocabulary, structure, and phrasing from the above.\n`;
  }

  prompt += `\nApply all System Role rules and generate the JSON object now:`;
  return prompt;
}

// ─── Main Execute Functions ─────────────────────────────────────────────────

/**
 * Generates all three rephrase variants (standard, lively, short) via Gemini.
 * Automatically cycles through API keys then models on failure.
 * Falls back to heuristic variants only when ALL Gemini calls fail.
 */
export async function executeRephrase(options) {
  const {
    baseText,
    toneId,
    categoryTitle,
    subsectionTitle,
    avoidHistory = [],
  } = options;

  const { maskedText, slotMap } = maskEntities(baseText);

  const prompt = buildPrompt({
    baseText: maskedText,
    toneId,
    categoryTitle,
    subsectionTitle,
    avoidHistory,
  });

  const availableKeys = getApiKeys();

  if (availableKeys.length > 0) {
    for (const { name: keyName, key } of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const model of CANDIDATE_MODELS) {
        try {
          console.log(`[Gemini] Trying key "${keyName}" with model "${model}"...`);

          const apiCall = ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              // High temperature ensures each call produces noticeably different outputs
              temperature: 1.0,
              topP: 0.97,
              topK: 40,
            },
          });

          // 15-second timeout — enough time for Gemini Flash to respond
          const response = await withTimeout(apiCall, 15000);
          const rawText  = (response.text || '{}').trim();

          let parsed;
          try {
            parsed = JSON.parse(rawText);
          } catch {
            // Sometimes Gemini wraps output in ```json ... ``` — strip it
            const stripped = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            parsed = JSON.parse(stripped);
          }

          const standardClean = validateAndCleanOutput(parsed.standard || '', slotMap);
          const livelyClean   = validateAndCleanOutput(parsed.lively   || '', slotMap);
          const shortClean    = cleanShortOutput(parsed.short, slotMap);

          if (standardClean && livelyClean && shortClean.length > 0) {
            console.log(`[Gemini] ✅ Success — key "${keyName}", model "${model}"`);
            return {
              standard: standardClean,
              lively:   livelyClean,
              short:    shortClean,
              fromCache: false,
              keyUsed:  keyName,
            };
          } else {
            console.warn(`[Gemini] Model "${model}" returned incomplete fields — trying next.`);
          }
        } catch (err) {
          console.warn(`[Gemini] Key "${keyName}" / model "${model}" failed:`, cleanErrorMessage(err));
        }
      }
    }
  }

  // All Gemini routes failed → return styled offline variations
  console.warn('[Gemini] All API routes failed. Using heuristic fallback.');
  const fallback = generateInstantFallback(baseText, toneId);
  return {
    ...fallback,
    fromCache: false,
    keyUsed: 'Offline Heuristic',
  };
}

/**
 * Regenerates a single variant (standard | lively | short) via Gemini.
 */
export async function executeSingleRephrase(type, options) {
  const { baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] } = options;
  const { maskedText, slotMap } = maskEntities(baseText);
  const prompt = buildPrompt({ baseText: maskedText, toneId, categoryTitle, subsectionTitle, avoidHistory });

  const availableKeys = getApiKeys();
  if (availableKeys.length > 0) {
    for (const { name: keyName, key } of availableKeys) {
      const ai = new GoogleGenAI({ apiKey: key });

      for (const model of CANDIDATE_MODELS) {
        try {
          const apiCall = ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 1.0,
              topP: 0.97,
              topK: 40,
            },
          });

          const response = await withTimeout(apiCall, 15000);
          const rawText  = (response.text || '{}').trim();

          let parsed;
          try {
            parsed = JSON.parse(rawText);
          } catch {
            const stripped = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            parsed = JSON.parse(stripped);
          }

          if (type === 'short') {
            const shortClean = cleanShortOutput(parsed.short, slotMap);
            if (shortClean && shortClean.length > 0) return shortClean;
          } else {
            const cleaned = validateAndCleanOutput(parsed[type] || '', slotMap);
            if (cleaned) return cleaned;
          }
        } catch (err) {
          console.warn(`[Gemini Single] Key "${keyName}" / model "${model}" failed:`, cleanErrorMessage(err));
        }
      }
    }
  }

  const fallback = generateInstantFallback(baseText, toneId);
  return fallback[type] || baseText;
}
