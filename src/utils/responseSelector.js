// src/utils/responseSelector.js
// Utility to select a varied response per category, tracking usage to avoid repetition.
// Stores simple usage statistics in a JSON file (responseStats.json) next to this module.

import fs from 'fs';
import path from 'path';

const statsFile = path.resolve(import.meta.url.replace('file://', ''), '../responseStats.json');

/** Load usage stats, creating the file if missing */
function loadStats() {
  try {
    const data = fs.readFileSync(statsFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // Initialize empty stats
    const empty = {};
    fs.writeFileSync(statsFile, JSON.stringify(empty, null, 2));
    return empty;
  }
}

/** Persist stats */
function saveStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
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
  responses.forEach((r, idx) => {
    const key = `r${idx}`;
    if (!stats[key]) stats[key] = 0;
  });
  // Find minimum usage count
  const minUsage = Math.min(...responses.map((_, idx) => stats[`r${idx}`]));
  // Gather candidates with min usage
  const candidates = responses.filter((_, idx) => stats[`r${idx}`] === minUsage);
  // Randomly pick among candidates
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  // Update usage for the chosen index
  const chosenIdx = responses.indexOf(chosen);
  stats[`r${chosenIdx}`] = (stats[`r${chosenIdx}`] || 0) + 1;
  saveStats(stats);
  return chosen.text;
}
