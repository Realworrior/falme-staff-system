const FAVORITES_KEY = 'betfalme_template_favorites';

/**
 * Get favorite template IDs from localStorage.
 * @returns {string[]}
 */
export function getFavoriteTemplateIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Toggle a template in favorites.
 * @param {string} templateId
 * @param {string[]} currentFavorites
 * @returns {string[]} Updated favorites array
 */
export function toggleFavoriteTemplate(templateId, currentFavorites) {
  const isFav = currentFavorites.includes(templateId);
  const updated = isFav
    ? currentFavorites.filter((id) => id !== templateId)
    : [...currentFavorites, templateId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
  return updated;
}
