export function clampMidi(value) {
  return Math.max(0, Math.min(127, Number(value) || 0));
}

export const clamp7 = clampMidi;

export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getTabComponentMap(tabEntries, componentEntries) {
  const componentMap = Object.fromEntries(componentEntries);
  const missing = tabEntries
    .map((tab) => tab.id)
    .filter((tabId) => typeof componentMap[tabId] !== 'function');

  if (missing.length) {
    throw new Error(`Missing tab component mapping for: ${missing.join(', ')}`);
  }

  return componentMap;
}
