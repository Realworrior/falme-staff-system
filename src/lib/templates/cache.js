/**
 * In-memory LRU cache for generated rephrased variants (30-minute TTL, 80 entry max).
 */
class ClientRephraseCache {
  constructor() {
    this._cache = new Map();
    this._maxEntries = 80;
    this._ttlMs = 1000 * 60 * 30; // 30 minutes
  }

  _makeKey(baseText, toneId) {
    return `${toneId}::${baseText.trim()}`;
  }

  get(baseText, toneId) {
    const key = this._makeKey(baseText, toneId);
    const entry = this._cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this._ttlMs) {
      this._cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(baseText, toneId, data) {
    const key = this._makeKey(baseText, toneId);
    if (this._cache.size >= this._maxEntries) {
      const oldestKey = this._cache.keys().next().value;
      if (oldestKey) this._cache.delete(oldestKey);
    }
    this._cache.set(key, { data, timestamp: Date.now() });
  }

  clear() {
    this._cache.clear();
  }
}

export const clientCache = new ClientRephraseCache();
