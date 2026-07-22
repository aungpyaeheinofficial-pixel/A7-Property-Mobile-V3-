const STORAGE_KEYS = {
  saved: "a7-property-saved-homes",
  recent: "a7-property-recent-homes",
  legacySaved: "eain-saved-homes",
  legacyRecent: "eain-recent-properties",
} as const;

function readStoredIds(key: string, legacyKey?: string) {
  try {
    const value = window.localStorage.getItem(key) ?? (legacyKey ? window.localStorage.getItem(legacyKey) : null);
    return value ? JSON.parse(value) as string[] : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key: string, ids: string[]) {
  window.localStorage.setItem(key, JSON.stringify(ids));
}

export { readStoredIds, STORAGE_KEYS, writeStoredIds };
