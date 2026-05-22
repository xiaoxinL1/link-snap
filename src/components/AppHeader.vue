<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

defineProps<{
  onToggleHistory: () => void
  onToggleSettings: () => void
  historyCount: number
}>()

const { theme, toggleTheme } = useTheme()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="brand">
        <div class="logo">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" rx="10" fill="var(--color-accent)" />
            <path d="M9 14.5a2.5 2.5 0 0 1 2.5-2.5h3l3 5-3 5h-3A2.5 2.5 0 0 1 9 19.5v-5Z" fill="white" opacity="0.95" />
            <path d="M25 14.5a2.5 2.5 0 0 0-2.5-2.5h-3l-3 5 3 5h3A2.5 2.5 0 0 0 25 19.5v-5Z" fill="white" opacity="0.7" />
            <rect x="15" y="11" width="4" height="12" rx="1" fill="white" />
          </svg>
        </div>
        <div class="title-group">
          <h1 class="app-title">LinkSnap</h1>
          <p class="app-subtitle">AI 智能链接总结</p>
        </div>
      </div>
      <div class="header-actions">
        <button
          class="icon-btn"
          :title="theme === 'light' ? '切换暗色模式' : '切换亮色模式'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'light'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>
        <button class="icon-btn" title="历史记录" @click="onToggleHistory">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span v-if="historyCount > 0" class="badge">{{ historyCount }}</span>
        </button>
        <button class="icon-btn" title="设置" @click="onToggleSettings">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--color-surface);
  box-shadow: var(--shadow-raised);
  backdrop-filter: blur(12px);
}

.header-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo { flex-shrink: 0; }

.title-group {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.02em;
}

.app-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin: 0;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 14px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.icon-btn:hover {
  background: var(--color-surface);
  box-shadow: var(--shadow-button-hover);
  color: var(--color-text);
}

.icon-btn:active {
  box-shadow: var(--shaodw-button-active);
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--color-accent);
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

@media (max-width: 600px) {
  .header-inner { padding: 12px 16px; }
  .app-title { font-size: 1.15rem; }
}
</style>
