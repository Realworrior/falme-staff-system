/**
 * Extracts all strict numbers, currencies (KSh 50, KSh 100k), timeframes (48h, 72 hours),
 * and URLs into deterministic slots so the LLM cannot hallucinate or mutate them.
 * @param {string} text
 * @returns {{ maskedText: string, slotMap: Record<string,string>, detectedEntitiesCount: number }}
 */
export function maskEntities(text) {
  const slotMap = {};
  let slotIndex = 1;
  let masked = text;

  // 1. URLs and domains
  const urlRegex =
    /\b(?:https?:\/\/|www\.)[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/))|b[a-zA-Z0-9-]+\.ke(?:\/[^\s.,;)]*)?\b/gi;
  masked = masked.replace(urlRegex, (match) => {
    const slot = `{{URL_${slotIndex++}}}`;
    slotMap[slot] = match;
    return slot;
  });

  // 2. Currencies and specific amounts (KSh 50, KSh 100,000, KSh 100k, KES 500)
  const currencyRegex = /\b(?:KSh|KES|sh)\s*[\d,]+(?:\.\d+)?(?:k|M|K)?\b/gi;
  masked = masked.replace(currencyRegex, (match) => {
    const slot = `{{AMOUNT_${slotIndex++}}}`;
    slotMap[slot] = match;
    return slot;
  });

  // 3. Time windows and timeframes
  const timeRegex =
    /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)\b|\b\d+\s*(?:hours?|hrs?|mins?|minutes?|days?|business days?|seconds?|secs?)\b|\b\d+h\b|\b24\/7\b/gi;
  masked = masked.replace(timeRegex, (match) => {
    const slot = `{{TIME_${slotIndex++}}}`;
    slotMap[slot] = match;
    return slot;
  });

  return {
    maskedText: masked,
    slotMap,
    detectedEntitiesCount: Object.keys(slotMap).length,
  };
}

/**
 * Re-injects original extracted entities back into the LLM output.
 * Strips all curly braces so no placeholders leak into output.
 * @param {string} text
 * @param {Record<string,string>} slotMap
 * @returns {string}
 */
export function unmaskEntities(text, slotMap) {
  let result = text;

  for (const [slot, value] of Object.entries(slotMap)) {
    // 1. Exact pattern match: {{URL_1}}
    const exactPattern = new RegExp(slot.replace(/[{}]/g, '\\$&'), 'g');
    result = result.replace(exactPattern, value);

    // 2. Raw token match: URL_1
    const rawSlot = slot.replace(/[{}]/g, '');
    const rawPattern = new RegExp(`\\b${rawSlot}\\b`, 'g');
    result = result.replace(rawPattern, value);
  }

  // 3. Strip any residual curly brackets around URLs or tokens e.g. {https://...} or {{...}}
  result = result.replace(/[{}]/g, '');

  return result;
}

/**
 * Validates and cleans output from LLM, unmasking entities cleanly.
 * @param {string} text
 * @param {Record<string,string>} slotMap
 * @returns {string}
 */
export function validateAndCleanOutput(text, slotMap) {
  let cleaned = unmaskEntities(text, slotMap);
  cleaned = cleaned
    .replace(/^["'`]|["'`]$/g, '')
    .replace(/—/g, ' - ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[-*•]\s+/g, '')
    .replace(/[{}]/g, '') // Strict removal of all curly braces
    .trim();
  return cleaned;
}
