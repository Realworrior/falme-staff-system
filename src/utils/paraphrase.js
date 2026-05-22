// src/utils/paraphrase.js
// Simple paraphrasing utility – generates a fresh‑looking version of a response
// by randomly swapping words with synonyms from a small dictionary.
// This is a lightweight fallback when a full Gemini paraphrase service is unavailable.

const SYNONYM_MAP = {
  // greetings
  hello: ["hi", "hey", "greetings"],
  hi: ["hello", "hey", "greetings"],
  greetings: ["welcome", "salutations"],
  // apologies / sorry
  sorry: ["apologies", "regret", "I apologise"],
  apologies: ["sorry", "regret"],
  // thank you
  thanks: ["thank you", "many thanks", "appreciate it"],
  "thank you": ["thanks", "much appreciated"],
  // help / assist
  help: ["assist", "support", "aid"],
  assist: ["help", "support", "aid"],
  // good / fine
  good: ["great", "excellent", "fine"],
  great: ["good", "excellent", "fine"],
  // please
  please: ["kindly", "if you could"],
  // immediately / now
  immediately: ["right away", "as soon as possible", "instantly"],
  now: ["currently", "right now", "at this moment"],
  // contact
  "contact us": ["reach out", "get in touch"],
  "reach out": ["contact us", "get in touch"],
  // etc. Add more as needed.
};

/**
 * Randomly replace words in the input string with synonyms.
 * Keeps punctuation and capitalization intact where possible.
 * @param {string} text – original response text
 * @returns {string} – paraphrased version
 */
export function getRandomParaphrase(text) {
  // Split on word boundaries while preserving punctuation
  const tokens = text.split(/(\b)/);
  const paraphrased = tokens.map(tok => {
    const lower = tok.toLowerCase();
    if (SYNONYM_MAP[lower]) {
      const synonyms = SYNONYM_MAP[lower];
      // Randomly decide whether to replace (30% chance)
      if (Math.random() < 0.3) {
        const replacement = synonyms[Math.floor(Math.random() * synonyms.length)];
        // Preserve original capitalization
        if (tok[0] === tok[0]?.toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
    }
    return tok;
  });
  return paraphrased.join('');
}

/**
 * Async wrapper that could later be swapped for a real Gemini API call.
 * For now it simply resolves immediately with the synchronous paraphrase.
 */
export async function paraphraseAsync(text) {
  return getRandomParaphrase(text);
}
