/**
 * Helper to generate storage keys using VITE_STORAGE_PREFIX environment variable
 * Ensures consistent key naming across all data modules
 */
export function getStorageKey(module: string, version: string = 'v1'): string {
  const prefix = import.meta.env.VITE_STORAGE_PREFIX || 'app';
  return `${prefix}.${module}.${version}`;
}

/**
 * Helper to generate event names using VITE_STORAGE_PREFIX
 */
export function getEventName(module: string): string {
  const prefix = import.meta.env.VITE_STORAGE_PREFIX || 'app';
  return `${prefix}:${module}`;
}
