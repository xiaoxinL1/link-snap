<script setup lang="ts">
withDefaults(defineProps<{
  text: string
  label?: string
}>(), { label: '原文预览' })
</script>

<template>
  <div class="source-preview">
    <div class="preview-label">{{ label }}</div>
    <div class="preview-text">{{ text.slice(0, 300) }}{{ text.length > 300 ? '…' : '' }}</div>
  </div>
</template>

<style scoped>
.source-preview {
  margin: 0 28px 24px;
  padding: 16px 18px;
  border-radius: 16px;
  background: var(--color-bg);
  box-shadow: var(--shadow-pressed);
}

.preview-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 10px;
}

.preview-text {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  max-height: 120px;
  overflow-y: auto;
}
</style>
