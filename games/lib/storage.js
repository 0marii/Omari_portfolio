/** @typedef {string} StorageKey */

/**
 * @param {StorageKey} key
 * @param {number} [fallback=0]
 */
export function getHi(key, fallback = 0) {
  try {
    const v = localStorage.getItem(key);
    return v == null ? fallback : Number(v) || fallback;
  } catch {
    return fallback;
  }
}

/**
 * @param {StorageKey} key
 * @param {number} value
 */
export function setHi(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

/**
 * @param {StorageKey} key
 * @param {unknown} fallback
 */
export function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * @param {StorageKey} key
 * @param {unknown} value
 */
export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
