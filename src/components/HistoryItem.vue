<script setup lang="ts">
import { computed } from 'vue'
import type { HistoryItem as HistoryItemType } from '../composables/useHistory'

const props = defineProps<{
  item: HistoryItemType
}>()

const emit = defineEmits<{
  select: []
  remove: []
}>()

const dateStr = computed(() => {
  const d = new Date(props.item.createdAt)
  return d.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<template>
  <li class="history-item" @click="emit('select')">
    <div class="item-content">
      <div class="item-title">{{ item.title }}</div>
      <div class="item-meta">
        <span class="item-domain">{{ item.domain }}</span>
        <span class="item-date">{{ dateStr }}</span>
      </div>
      <div class="item-summary">{{ item.summary.slice(0, 80) }}{{ item.summary.length > 80 ? '…' : '' }}</div>
    </div>
    <button
      class="item-delete"
      title="删除"
      @click.stop="emit('remove')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </button>
  </li>
</template>

<style scoped>
.history-item {
  display: flex;
  align-items: flex-start;
  padding: 14px 28px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.history-item:hover {
  background: var(--color-bg-hover);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.item-domain {
  font-size: 0.7rem;
  color: var(--color-accent);
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--color-accent-bg);
}

.item-date {
  font-size: 0.72rem;
  color: var(--color-text-tertiary);
}

.item-summary {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin-top: 3px;
  margin-left: 10px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
  opacity: 0;
}

.history-item:hover .item-delete { opacity: 1; }

.item-delete:hover {
  background: var(--color-danger-bg);
  box-shadow: var(--shadow-button);
  color: var(--color-danger);
}
</style>
