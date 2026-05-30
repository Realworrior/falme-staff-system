// src/utils/responseSelector.js
// Utility to select a varied response per category, tracking usage to avoid repetition.
// Stores simple usage statistics in localStorage.

/** Load usage stats */
function loadStats() {
  try {
    return JSON.parse(localStorage.getItem('blastchat_response_stats') || '{}');
  } catch {
    return {};
  }
}

/** Persist stats */
function saveStats(stats) {
  try {
    localStorage.setItem('blastchat_response_stats', JSON.stringify(stats));
  } catch {
    // ignore
  }
}

/**
 * Pick a response from an array, preferring the least used ones.
 * @param {Array<{text:string}>} responses
 * @returns {string} selected response text
 */
export function selectResponse(responses) {
  if (!Array.isArray(responses) || responses.length === 0) {
    return '';
  }
  const stats = loadStats();
  // Ensure each response has an entry in stats
  responses.forEach((r) => {
    const key = `r_${r.text.substring(0, 30)}`;
    if (!stats[key]) stats[key] = 0;
  });
  // Find minimum usage count
  const minUsage = Math.min(...responses.map(r => stats[`r_${r.text.substring(0, 30)}`] || 0));
  // Gather candidates with min usage
  const candidates = responses.filter(r => (stats[`r_${r.text.substring(0, 30)}`] || 0) === minUsage);
  // Randomly pick among candidates
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  // Update usage for the chosen key
  const chosenKey = `r_${chosen.text.substring(0, 30)}`;
  stats[chosenKey] = (stats[chosenKey] || 0) + 1;
  saveStats(stats);
  return chosen.text;
}
