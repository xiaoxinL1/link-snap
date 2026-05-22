<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import UrlInput from './components/UrlInput.vue'
import WelcomeGuide from './components/WelcomeGuide.vue'
import SummaryCard from './components/SummaryCard.vue'
import HistoryDrawer from './components/HistoryDrawer.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ParticleBackground from './components/ParticleBackground.vue'
import { useSummary } from './composables/useSummary'
import { useHistory } from './composables/useHistory'
import { useTheme } from './composables/useTheme'
import { useSettings } from './composables/useSettings'
import { parseShareText } from './utils/share'

const { status, error, result, summarize, reset } = useSummary()
const { history, removeItem, clearAll } = useHistory()
const { settings, updateSettings, resetSettings } = useSettings()

useTheme()

const showHistory = ref(false)
const showSettings = ref(false)
const currentUrl = ref('')

function handleSubmit(input: string) {
  const shareInfo = parseShareText(input.trim())
  currentUrl.value = shareInfo && shareInfo.isShare ? shareInfo.url : input
  summarize(input, settings.value)
}

function handleHistorySelect(id: string) {
  const item = history.value.find((h) => h.id === id)
  if (item) {
    result.value = {
      title: item.title,
      domain: item.domain,
      summary: item.summary,
      rawText: item.rawText,
      url: item.url,
      type: item.type,
      hasTranscript: false,
    }
    currentUrl.value = item.url
    status.value = 'done'
    error.value = ''
    showHistory.value = false
  }
}

function handleRegenerate() {
  if (currentUrl.value) {
    summarize(currentUrl.value, settings.value)
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showHistory.value) {
      showHistory.value = false
    } else if (showSettings.value) {
      showSettings.value = false
    } else {
      currentUrl.value = ''
      reset()
    }
  }
}
</script>

<template>
  <ParticleBackground />
  <div class="app-shell" @keydown="handleKeydown">
    <AppHeader
      :history-count="history.length"
      :on-toggle-history="() => (showHistory = !showHistory)"
      :on-toggle-settings="() => (showSettings = !showSettings)"
    />

    <main class="main-content">
      <div class="content-card">
        <UrlInput @submit="handleSubmit" />

        <div class="content-spacer">
          <div v-if="error" class="error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{{ error }}</span>
            <button class="error-dismiss" @click="reset">&times;</button>
          </div>

          <div v-if="status === 'fetching' || status === 'extracting' || status === 'transcribing' || status === 'summarizing'" class="loading-section">
            <div class="loading-spinner" />
            <p class="loading-text">
              <template v-if="status === 'fetching'">正在获取网页内容…</template>
              <template v-else-if="status === 'extracting'">正在提取正文…</template>
              <template v-else-if="status === 'transcribing'">正在获取视频字幕/文案…</template>
              <template v-else>AI 正在生成总结…</template>
            </p>
            <p class="loading-domain">{{ currentUrl }}</p>
          </div>

          <WelcomeGuide v-if="status === 'idle' && !error && !result" />

          <SummaryCard
            v-if="status === 'done' && result"
            :result="result"
            @regenerate="handleRegenerate"
          />
        </div>
      </div>
    </main>

    <HistoryDrawer
      :open="showHistory"
      :items="history"
      @close="showHistory = false"
      @select="handleHistorySelect"
      @remove="removeItem"
      @clear-all="clearAll"
    />

    <SettingsPanel
      :open="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update="updateSettings"
      @reset="resetSettings"
    />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 40px 24px 80px;
}

.content-card {
  max-width: 760px;
  margin: 0 auto;
}

.content-spacer {
  margin-top: 28px;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 0.88rem;
  animation: fadeIn 0.25s ease;
  box-shadow: var(--shadow-raised);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.error-dismiss {
  margin-left: auto;
  border: none;
  background: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.error-dismiss:hover {
  opacity: 1;
}

.loading-section {
  text-align: center;
  padding: 56px 24px;
  border-radius: 24px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 3px solid var(--color-bg-hover);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.loading-domain {
  font-size: 0.78rem;
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .main-content {
    padding: 24px 16px 40px;
  }
}
</style>
