import { ref } from 'vue'
import { getItem, setItem } from '../utils/storage'

export interface HistoryItem {
  id: string
  url: string
  title: string
  domain: string
  summary: string
  rawText: string
  type: 'article' | 'video'
  createdAt: string
}

const MAX_HISTORY = 50

const history = ref<HistoryItem[]>(getItem<HistoryItem[]>('history', []))

function saveHistory() {
  setItem('history', history.value)
}

export function useHistory() {
  function addItem(item: Omit<HistoryItem, 'id' | 'createdAt'>) {
    const entry: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    history.value.unshift(entry)
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    saveHistory()
    return entry
  }

  function removeItem(id: string) {
    history.value = history.value.filter((h) => h.id !== id)
    saveHistory()
  }

  function clearAll() {
    history.value = []
    saveHistory()
  }

  return {
    history,
    addItem,
    removeItem,
    clearAll,
  }
}
