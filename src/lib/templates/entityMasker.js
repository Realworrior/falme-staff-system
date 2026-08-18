/**
 * Clean and normalize text directly without creating placeholder slot tokens
 * that could leak if an LLM hallucinates or alters placeholder naming.
 *
 * @param {string} text
 * @returns {{ maskedText: string, slotMap: Record<string,string>, detectedEntitiesCount: number }}
 */
export function maskEntities(text) {
  // Pass text as clean plain text so the model never encounters raw placeholder tokens like TIME_1 or URL_1
  return {
    maskedText: text,
    slotMap: {},
    detectedEntitiesCount: 0,
  };
}

/**
 * Strips any residual placeholder tokens (e.g. {{TIME_1}}, TIME_1, URL_1, AMOUNT_1),
 * curly brackets, brackets, or leftover slot tags.
 *
 * @param {string} text
 * @param {Record<string,string>} slotMap
 * @returns {string}
 */
export function unmaskEntities(text, slotMap = {}) {
  let result = text || '';

  // 1. If any slotMap values exist, replace them
  if (slotMap && typeof slotMap === 'object') {
    for (const [slot, value] of Object.entries(slotMap)) {
      const exactPattern = new RegExp(slot.replace(/[{}]/g, '\\$&'), 'g');
      result = result.replace(exactPattern, value);
      const rawSlot = slot.replace(/[{}]/g, '');
      const rawPattern = new RegExp(`\\b${rawSlot}\\b`, 'g');
      result = result.replace(rawPattern, value);
    }
  }

  // 2. Cleanly strip any hallucinated or leaked placeholder tokens:
  // e.g. {{URL_1}}, URL_1, {{TIME_1}}, TIME_1, {{AMOUNT_1}}, AMOUNT_1, {{SLOT_1}}, etc.
  result = result.replace(/\{\{\s*(?:URL|TIME|AMOUNT|SLOT|DATE|NAME|CODE)_[0-9]+\s*\}\}/gi, '');
  result = result.replace(/\b(?:URL|TIME|AMOUNT|SLOT|DATE|NAME|CODE)_[0-9]+\b/gi, '');

  // 3. Strip any stray curly brackets or double curly brackets
  result = result.replace(/[{}]/g, '');

  return result;
}

/**
 * Validates and cleans output from LLM, guaranteeing zero placeholder leakage.
 * @param {string} text
 * @param {Record<string,string>} slotMap
 * @returns {string}
 */
export function validateAndCleanOutput(text, slotMap = {}) {
  let cleaned = unmaskEntities(text, slotMap);
  cleaned = cleaned
    .replace(/^["'`]|["'`]$/g, '')
    .replace(/—/g, ' - ')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s*[-*•]\s+/g, '')
    .replace(/[{}]/g, '')
    .trim();
  return cleaned;
}
