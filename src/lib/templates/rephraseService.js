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

const GUARDRAILS_CORE = `MANDATORY FACTUAL & POLICY GUARDRAILS:
1. FACTUAL INTEGRITY: Output direct, ready-to-send English sentences with real facts, numbers, and full URLs intact (e.g. https://blastchat.chat/chat/falmebet). NEVER output variable placeholders or tokens such as TIME_1, URL_1, AMOUNT_1, [Company Name], or curly brackets {}.
2. NO INVENTED COMMITMENTS: Never promise refunds, compensation, bonuses, faster resolution times, or specific restoration deadlines not present in the source text.
3. INFORMATION PARITY: If the source asks the customer for specific details (registered phone number, M-PESA code, Bet ID, screenshot), the rewrite MUST request those exact same items.
4. NO CUSTOMER IDENTIFIERS: Do not add fake customer names or invented IDs.
5. NO GREETING CHAT LINKS: Do NOT add live support links to simple greetings (e.g. "Hello / Hi"), since the conversation is already taking place on live support.
6. FORMAT REQUIREMENT: Output clean continuous single-line English prose ready for immediate copying and pasting without editing.`;

// Officially supported & active Gemini API model identifiers (fastest first)
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
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

/**
 * Emergency offline fallback — only fires when ALL Gemini API calls fail.
 * Produces three genuinely distinct styles from the base text.
 */
function generateInstantFallback(baseText, toneId) {
  const clean = baseText.trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);

  // ── Standard: professional clean rewrite ──────────────────────────────────
  // Reorders phrasing slightly and keeps a neutral, clear tone
  const standard = clean
    .replace(/please note that/gi, 'Kindly be advised that')
    .replace(/kindly/gi, 'Please')
    .replace(/we are sorry/gi, 'We apologise')
    .replace(/feel free to/gi, 'do not hesitate to')
    .trim();

  // ── Lively: emoji-enhanced, energetic, step-oriented ────────────────────
  // Uses numbered emoji markers and warm openers
  let livelyParts = sentences.map((s, i) => {
    const marker = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i] || '👉';
    return `${marker} ${s.trim()}`;
  });
  let lively = `👋 ` + livelyParts.join(' ');
  if (!/[✅✨🎉]$/.test(lively)) lively += ' ✅';

  // ── Short: stripped, step-arrows, no filler words ────────────────────────
  // Uses → or › to separate key action points compactly
  const fillerRx = /\b(please note that|kindly note that|we would like to inform you that|we are pleased to inform you|as per our records|for your information)\b/gi;
  let shortened = clean
    .replace(fillerRx, '')
    .replace(/we are sorry to hear (that|about)\s*/gi, '')
    .replace(/we understand (your concern|that you|how)\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Split on punctuation boundaries then join with arrows
  const shortParts = shortened
    .split(/(?<=[.!?])\s+/)
    .map(s => s.replace(/[.!]+$/, '').trim())
    .filter(Boolean);

  const short = shortParts.length > 1
    ? shortParts.join(' → ')
    : shortened;

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

// ─── Gemini System Instructions ────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are an expert AI customer support writer for Betfalme (betfalme.ke), Kenya's leading online betting platform operating in a live WhatsApp/chat environment.

${GUARDRAILS_CORE}

CRITICAL TASK — Generate exactly THREE (3) response versions from the base message supplied by the agent. The three versions MUST be clearly and noticeably different from each other AND from the original. DO NOT copy-paste the original.

════════════════════════════════════════════════════════════════════
VERSION 1 — "standard"
Purpose: A professional, neutral rewrite matching the selected tone.
Rules:
- Completely restructure sentence order and vocabulary — no phrase duplication from the source.
- Fluent continuous prose. No emojis. No bullet points. No em dashes. No step markers.
- Must still convey every factual item (amounts, codes, URLs, steps) from the original.
════════════════════════════════════════════════════════════════════
VERSION 2 — "lively"
Purpose: Warm, energetic, emoji-rich live-chat version. High engagement.
Rules:
- Open with a friendly emoji (e.g. 👋 Hi there! or ✨ Great news! depending on context).
- Use inline step/direction symbols to guide the customer through actions: 1️⃣ 2️⃣ 3️⃣, ✅, 👉, 📲, 💬, 🎉 etc.
- ONLY use these types of symbols inline — do NOT use newlines or bullet characters (•, -, *).
- End with a warm closing such as "Let us know if you need anything else! 😊" or "We've got you covered! ✅".
- Single unbroken line of text. No em dashes. No line breaks.
════════════════════════════════════════════════════════════════════
VERSION 3 — "short"
Purpose: Ultra-concise, direct action guide. Strips all pleasantries.
Rules:
- Remove ALL filler: "Please note that", "Kindly be informed", "We would like to inform you", "We understand your concern", "We are sorry to hear", "Feel free to" etc.
- Keep ONLY the core action steps and required data points.
- Use arrow/step symbols to separate steps instead of newlines: → or › or >> (since the chat box does not support lists or line breaks).
- Must be noticeably shorter than both Standard and Lively versions.
- Single concise line. No em dashes. No line breaks.
════════════════════════════════════════════════════════════════════

You MUST respond strictly with a valid JSON object matching this schema (no markdown code fences, no extra text):
{
  "standard": "string",
  "lively": "string",
  "short": "string"
}`;

function buildPrompt({ baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] }) {
  const tone = TONE_MAP[toneId] || TONE_MAP.standard;
  let prompt = '';
  if (categoryTitle)   prompt += `Category: ${categoryTitle}\n`;
  if (subsectionTitle) prompt += `Topic: ${subsectionTitle}\n`;
  prompt += `\nAgent Base Message:\n"""${baseText.trim()}"""\n\nTarget Tone: ${tone.label} — ${tone.desc}\n`;

  if (avoidHistory && avoidHistory.length > 0) {
    prompt += `\nAVOID recycling vocabulary or structure from these previously generated versions:\n`;
    avoidHistory.forEach(t => { prompt += `- """${t}"""\n`; });
    prompt += `\nThe new versions must feel fresh and distinct from the above.\n`;
  }

  prompt += `\nGenerate the JSON object with the three uniquely styled versions now:`;
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
          const shortClean    = validateAndCleanOutput(parsed.short    || '', slotMap);

          if (standardClean && livelyClean && shortClean) {
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

          const cleaned = validateAndCleanOutput(parsed[type] || '', slotMap);
          if (cleaned) return cleaned;
        } catch (err) {
          console.warn(`[Gemini Single] Key "${keyName}" / model "${model}" failed:`, cleanErrorMessage(err));
        }
      }
    }
  }

  const fallback = generateInstantFallback(baseText, toneId);
  return fallback[type] || baseText;
}
