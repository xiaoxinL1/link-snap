const STORAGE_PREFIX = 'linksnap_'

export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    console.warn(`Failed to save ${key} to localStorage`)
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch {
    console.warn(`Failed to remove ${key} from localStorage`)
  }
}
