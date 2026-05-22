<script setup lang="ts">
import { computed } from 'vue'
import HistoryItem from './HistoryItem.vue'
import type { HistoryItem as HistoryItemType } from '../composables/useHistory'

const props = defineProps<{
  open: boolean
  items: HistoryItemType[]
}>()

const emit = defineEmits<{
  close: []
  select: [id: string]
  remove: [id: string]
  clearAll: []
}>()

const hasItems = computed(() => props.items.length > 0)
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer-overlay" @click.self="emit('close')">
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3 class="drawer-title">
              历史记录
              <span v-if="hasItems" class="count">{{ items.length }}</span>
            </h3>
            <div class="drawer-header-actions">
              <button
                v-if="hasItems"
                class="danger-btn"
                @click="emit('clearAll')"
              >
                清空全部
              </button>
              <button class="close-btn" @click="emit('close')" aria-label="关闭">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="drawer-body">
            <div v-if="!hasItems" class="empty-state">
              <p>暂无历史记录</p>
            </div>
            <TransitionGroup v-else name="list" tag="ul" class="history-list">
              <HistoryItem
                v-for="item in items"
                :key="item.id"
                :item="item"
                @select="emit('select', item.id)"
                @remove="emit('remove', item.id)"
              />
            </TransitionGroup>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 420px;
  max-width: 90vw;
  height: 100%;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 30px rgba(0, 0, 0, 0.08);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
}

.drawer-title {
  font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  font-family: 'DM Sans', 'Inter', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
}

.drawer-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.danger-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-danger);
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn:hover {
  background: var(--color-danger-bg);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--color-bg-hover);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding-top: 4px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--color-text-tertiary);
  font-size: 0.9rem;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer-panel,
.drawer-leave-to .drawer-panel {
  transform: translateX(100%);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
