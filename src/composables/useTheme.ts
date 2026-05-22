import { ref, watchEffect } from 'vue'
import { getItem, setItem } from '../utils/storage'

type Theme = 'light' | 'dark'

const theme = ref<Theme>(getItem<Theme>('theme', 'light'))

export function useTheme() {
  watchEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.value)
    setItem('theme', theme.value)
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setTheme(t: Theme) {
    theme.value = t
  }

  return {
    theme,
    toggleTheme,
    setTheme,
  }
}
