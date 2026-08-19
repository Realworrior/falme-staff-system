import { GoogleGenAI } from '@google/genai';
import { maskEntities, validateAndCleanOutput } from './entityMasker';
import { clientCache } from './cache';

const TONE_MAP = {
  standard: { label: 'Standard', desc: 'Neutral, clear, and professional.' },
  high_empathy: { label: 'High Empathy', desc: 'Warm, reassuring, and deeply validating.' },
  firm: { label: 'Firm', desc: 'Calm, assertive, unambiguous, and non-negotiable.' },
  friendly: { label: 'Friendly', desc: 'Relaxed, upbeat, conversational, and approachable.' },
  formal: { label: 'Formal', desc: 'Polished, authoritative, respectful, and precise.' },
  reassuring: { label: 'Reassuring', desc: 'Steady, confidence-building, calm, and soothing.' },
  direct: { label: 'Direct', desc: 'Punchy, concise, action-first, and to-the-point.' },
};

const GUARDRAILS_CORE = `MANDATORY FACTUAL & POLICY GUARDRAILS:
1. FACTUAL INTEGRITY: Output direct, ready-to-send English sentences with real facts, numbers, and full URLs intact (e.g. https://blastchat.chat/chat/falmebet). NEVER output variable placeholders or tokens such as TIME_1, URL_1, AMOUNT_1, [Company Name], or curly brackets {}.
2. NO INVENTED COMMITMENTS: Never promise refunds, compensation, bonuses, faster resolution times, or specific restoration deadlines not present in the source text.
3. INFORMATION PARITY: If the source asks the customer for specific details (registered phone number, M-PESA code, Bet ID, screenshot), the rewrite MUST request those exact same items.
4. NO CUSTOMER IDENTIFIERS: Do not add fake customer names or invented IDs.
5. NO GREETING CHAT LINKS: Do NOT add live support links to simple greetings (e.g. "Hello / Hi"), since the conversation is already taking place on live support.
6. FORMAT REQUIREMENT: Output clean continuous single-line English prose ready for immediate copying and pasting without editing.`;

const REPHRASING_DIRECTIVE = `CREATIVE REPHRASING & VOCABULARY DIVERSITY MANDATE:
- Do NOT perform trivial word-for-word substitutions or copy the original sentence structure.
- Reconstruct sentences from scratch using varied synonyms, fresh openings, and diverse syntax while perfectly preserving the core message and all factual parameters.
- Each of the three generated variants (standard, lively, short) MUST feel distinctly different from the base text AND from each other.`;

// Officially supported & active Gemini API model identifiers (fastest first)
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
];

function cleanErrorMessage(err) {
  if (!err) return 'An unexpected error occurred.';
  const msg = typeof err === 'string' ? err : err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // String is not JSON
  }
  return msg;
}

/**
 * Intelligent instant heuristic generator used as fallback if network/API hangs or fails.
 */
function generateInstantFallback(baseText, toneId) {
  const clean = baseText.trim();
  
  // Standard: Clean, direct, professional
  const standard = clean;

  // Friendly: Warm greeting, emoji touch, conversational tone
  let lively = clean;
  if (!/^(hi|hello|hey|welcome)/i.test(lively)) {
    lively = `👋 Hello! ${lively}`;
  }
  if (!/[!✨✅👍]/.test(lively)) {
    lively = `${lively} We're here to assist you! ✨`;
  }

  // Short: Concise, direct action
  let short = clean
    .replace(/^hello|hi|good (morning|afternoon|evening)[,!.]?\s*/i, '')
    .replace(/we are sorry to hear that|we understand your concern[,.]?\s*/i, 'Note: ')
    .replace(/please feel free to|kindly ensure you|please note that/i, 'Please')
    .trim();

  if (!short) short = clean;

  return { standard, lively, short };
}

/**
 * Executes a promise with an automatic timeout to prevent infinite loading.
 */
function withTimeout(promise, ms = 4500) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Returns ordered list of API keys:
 * 1. Primary Key
 * 2. Secondary Key (Fallback)
 * 3. LocalStorage override / Legacy key
 */
export function getApiKeys() {
  const keys = [];
  const primary = import.meta.env.VITE_GEMINI_API_KEY_PRIMARY;
  const secondary = import.meta.env.VITE_GEMINI_API_KEY_SECONDARY;
  const userOverride = localStorage.getItem('betfalme_gemini_api_key');
  const legacyKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (userOverride && userOverride.trim()) keys.push({ name: 'Custom Override', key: userOverride.trim() });
  if (primary && primary.trim()) keys.push({ name: 'Primary', key: primary.trim() });
  if (secondary && secondary.trim()) keys.push({ name: 'Secondary', key: secondary.trim() });
  if (legacyKey && legacyKey.trim()) keys.push({ name: 'Default', key: legacyKey.trim() });

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

const SYSTEM_INSTRUCTION = `You are an expert AI customer support writer for Betfalme (betfalme.ke), Kenya's leading online betting platform.

${GUARDRAILS_CORE}

${REPHRASING_DIRECTIVE}

You will generate three DISTINCT versions with completely independent sentence constructions, vocabulary, and openings:
1. "standard": A fresh, fluent version matching the selected tone. Continuous natural prose. No emojis, no arrow symbols, no em dashes, no bullet points, no line breaks.
2. "lively": A warm, cheerful version using relevant emojis and inline directional/step symbols (e.g., 👋, ✨, 💬, 📲, 👉, 1️⃣, 2️⃣, ✅) to create high energy and warmth in live chat. Single continuous line, no line breaks, no em dashes.
3. "short": A compact, punchy version stripped of filler words while preserving every required data point, number, and requested field. Single short line. No line breaks, no em dashes.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "standard": "string",
  "lively": "string",
  "short": "string"
}`;

function buildPrompt({ baseText, toneId, categoryTitle, subsectionTitle, avoidHistory = [] }) {
  const tone = TONE_MAP[toneId] || TONE_MAP.standard;
  let prompt = '';
  if (categoryTitle) prompt += `Category: ${categoryTitle}\n`;
  if (subsectionTitle) prompt += `Topic: ${subsectionTitle}\n`;
  prompt += `\nOriginal Base Text:\n"""${baseText.trim()}"""\n\nTarget Tone: ${tone.label} (${tone.desc})\n`;
  if (avoidHistory && avoidHistory.length > 0) {
    prompt += `\nAvoid repeating these previous variants:\n`;
    avoidHistory.forEach((t) => {
      prompt += `- """${t}"""\n`;
    });
  }
  prompt += `\nGenerate the JSON object containing the three fresh versions now:`;
  return prompt;
}

/**
 * Executes rephrase with automatic Primary -> Secondary API key failover and instant fast fallback.
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
          const apiCall = ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              temperature: 0.85,
              topP: 0.95,
            },
          });

          // Enforce a strict 4.5 second timeout per call to prevent UI hanging
          const response = await withTimeout(apiCall, 4500);
          const rawText = (response.text || '{}').trim();
          const parsed = JSON.parse(rawText);

          const standardClean = validateAndCleanOutput(parsed.standard || '', slotMap);
          const livelyClean = validateAndCleanOutput(parsed.lively || '', slotMap);
          const shortClean = validateAndCleanOutput(parsed.short || '', slotMap);

          if (standardClean && livelyClean && shortClean) {
            return {
              standard: standardClean,
              lively: livelyClean,
              short: shortClean,
              fromCache: false,
              keyUsed: keyName,
            };
          }
        } catch (err) {
          const errMsg = cleanErrorMessage(err);
          console.warn(`[Gemini Fast Failover] Key "${keyName}" with model "${model}" failed/timed out:`, errMsg);
        }
      }
    }
  }

  // If all API models or keys fail/timeout, return instantaneous intelligent heuristic variations
  const fallback = generateInstantFallback(baseText, toneId);
  return {
    ...fallback,
    fromCache: false,
    keyUsed: 'Instant Heuristic',
  };
}

/**
 * Executes single variant regeneration with fast failover and timeout.
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
              temperature: 0.9,
              topP: 0.95,
            },
          });

          const response = await withTimeout(apiCall, 4500);
          const rawText = (response.text || '{}').trim();
          const parsed = JSON.parse(rawText);
          const cleaned = validateAndCleanOutput(parsed[type] || '', slotMap);
          if (cleaned) return cleaned;
        } catch (err) {
          const errMsg = cleanErrorMessage(err);
          console.warn(`[Gemini Fast Failover] Key "${keyName}" single rephrase model "${model}":`, errMsg);
        }
      }
    }
  }

  const fallback = generateInstantFallback(baseText, toneId);
  return fallback[type] || baseText;
}
