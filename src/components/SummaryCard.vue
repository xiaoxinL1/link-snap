<script setup lang="ts">
import { ref, computed } from 'vue'
import { Marked } from 'marked'
import SourcePreview from './SourcePreview.vue'
import type { SummaryResult } from '../composables/useSummary'

const props = defineProps<{
  result: SummaryResult
}>()

const emit = defineEmits<{
  regenerate: []
}>()

const showPreview = ref(false)
const copied = ref(false)

const marked = new Marked({
  breaks: true,
  gfm: true,
})

const renderedSummary = computed(() => {
  try {
    return marked.parse(props.result.summary) as string
  } catch {
    return props.result.summary
  }
})

async function copySummary() {
  try {
    await navigator.clipboard.writeText(props.result.summary)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = props.result.summary
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<template>
  <div class="summary-card">
    <div class="card-header">
      <div class="card-meta">
        <a :href="result.url" class="card-title" target="_blank" rel="noopener noreferrer">
          {{ result.title }}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="external-icon">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        <span class="card-domain">{{ result.domain }}</span>
        <span v-if="result.type === 'video'" class="card-video-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          视频
        </span>
        <span v-if="result.hasTranscript" class="card-transcript-badge">
          📝 含字幕
        </span>
      </div>
    </div>

    <div class="card-body markdown-body" v-html="renderedSummary" />

    <div class="card-actions">
      <button class="action-btn" @click="copySummary">
        <svg v-if="!copied" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {{ copied ? '已复制' : '复制总结' }}
      </button>
      <button class="action-btn" @click="showPreview = !showPreview">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ showPreview ? (result.type === 'video' ? '收起详情' : '收起原文') : (result.type === 'video' ? '查看详情' : '查看原文') }}
      </button>
      <button class="action-btn" @click="emit('regenerate')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        重新生成
      </button>
    </div>

    <SourcePreview
      v-if="showPreview"
      :text="result.rawText"
      :label="result.type === 'video' ? '视频元数据' : '原文预览'"
    />
  </div>
</template>

<style scoped>
.summary-card {
  background: var(--color-surface);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  animation: cardReveal 0.45s ease;
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  padding: 24px 28px 0;
}

.card-meta {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.card-title {
  font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-title:hover { color: var(--color-accent); }
.external-icon { opacity: 0.4; flex-shrink: 0; }

.card-domain {
  font-size: 0.76rem;
  color: var(--color-text-tertiary);
  padding: 3px 12px;
  border-radius: 10px;
  background: var(--color-bg);
}

.card-video-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: white;
  padding: 3px 10px;
  border-radius: 10px;
  background: var(--color-accent);
  font-weight: 600;
}

.card-transcript-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.72rem;
  color: var(--color-text);
  padding: 3px 10px;
  border-radius: 10px;
  background: var(--color-bg);
  font-weight: 600;
}

.card-body {
  padding: 20px 28px;
  font-size: 0.93rem;
  line-height: 1.8;
  color: var(--color-text);
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 0 28px 24px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border: none;
  border-radius: 14px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-button);
}

.action-btn:hover {
  color: var(--color-accent);
  box-shadow: var(--shadow-button-hover);
  transform: translateY(-1px);
}

.action-btn:active {
  box-shadow: var(--shaodw-button-active);
  transform: translateY(0);
}

@media (max-width: 600px) {
  .card-header,
  .card-body,
  .card-actions {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
