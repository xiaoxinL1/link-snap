<script setup lang="ts">
import { ref } from 'vue'

const url = ref('')

const emit = defineEmits<{
  submit: [value: string]
}>()

function handleSubmit() {
  const trimmed = url.value.trim()
  if (trimmed) {
    emit('submit', trimmed)
  }
}

function handleClear() {
  url.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="url-input-group">
    <div class="input-wrapper">
      <span class="input-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </span>
      <input
        v-model="url"
        type="text"
        class="url-input"
        placeholder="粘贴链接或抖音分享文案，按 Enter 或点击总结…"
        @keydown="handleKeydown"
      />
      <button
        v-show="url.length > 0"
        class="clear-btn"
        @click="handleClear"
        aria-label="清空"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
    <button
      class="submit-btn"
      :disabled="!url.trim()"
      @click="handleSubmit"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
      总结
    </button>
  </div>
</template>

<style scoped>
.url-input-group {
  display: flex;
  gap: 12px;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.url-input {
  width: 100%;
  padding: 14px 48px 14px 46px;
  border: none;
  border-radius: 18px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
  outline: none;
  box-shadow: var(--shadow-pressed);
}

.url-input:focus {
  box-shadow: var(--shadow-pressed), 0 0 0 3px var(--color-accent-ring);
}

.url-input::placeholder {
  color: var(--color-text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  box-shadow: var(--shadow-button);
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 24px;
  border: none;
  border-radius: 18px;
  background: var(--color-surface);
  color: var(--color-accent);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
  box-shadow: var(--shadow-button);
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-accent);
  color: white;
  box-shadow: 0 6px 20px var(--color-accent-shadow), var(--shadow-button-hover);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shaodw-button-active);
}

.submit-btn:disabled {
  color: var(--color-text-tertiary);
  box-shadow: none;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .url-input-group { flex-direction: column; }
  .submit-btn { justify-content: center; padding: 14px; }
}
</style>
