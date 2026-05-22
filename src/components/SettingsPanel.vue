<script setup lang="ts">
import { ref } from 'vue'
import type { Settings } from '../composables/useSettings'

const props = defineProps<{
  open: boolean
  settings: Settings
}>()

const emit = defineEmits<{
  close: []
  update: [partial: Partial<Settings>]
  reset: []
}>()

const localSettings = ref<Settings>({ ...props.settings })

function handleClose() {
  localSettings.value = { ...props.settings }
  emit('close')
}

function handleSave() {
  const diff = getDifferences()
  if (Object.keys(diff).length > 0) {
    emit('update', diff)
  }
  emit('close')
}

function getDifferences(): Partial<Settings> {
  const diff: Partial<Settings> = {}
  for (const key of Object.keys(localSettings.value) as (keyof Settings)[]) {
    if (localSettings.value[key] !== props.settings[key]) {
      ;(diff as Record<string, unknown>)[key] = localSettings.value[key]
    }
  }
  return diff
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal-overlay" @click.self="handleClose">
        <div class="modal-panel">
          <div class="modal-header">
            <h3 class="modal-title">设置</h3>
            <button class="close-btn" @click="handleClose" aria-label="关闭">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="setting-group">
              <label class="setting-label">API 密钥</label>
              <input
                v-model="localSettings.apiKey"
                type="password"
                class="setting-input"
                placeholder="sk-..."
              />
              <p class="setting-hint">密钥仅存储在您的浏览器本地，不会上传至任何服务器</p>
            </div>

            <div class="setting-group">
              <label class="setting-label">API 端点</label>
              <input
                v-model="localSettings.apiEndpoint"
                type="text"
                class="setting-input"
              />
            </div>

            <div class="setting-group">
              <label class="setting-label">模型名称</label>
              <input
                v-model="localSettings.model"
                type="text"
                class="setting-input"
              />
            </div>

            <div class="setting-group">
              <label class="setting-label">最大 Token 数</label>
              <input
                v-model.number="localSettings.maxTokens"
                type="number"
                class="setting-input"
                min="100"
                max="4096"
              />
            </div>

            <div class="setting-group">
              <label class="setting-label">提示词模板（文章）</label>
              <textarea
                v-model="localSettings.promptTemplate"
                class="setting-textarea"
                rows="6"
                placeholder="输入提示词模板..."
              />
              <p class="setting-hint">
                可用占位符：<code>{title}</code>、<code>{domain}</code>、<code>{content}</code>
              </p>
            </div>

            <div class="setting-group">
              <label class="setting-label">提示词模板（视频）</label>
              <textarea
                v-model="localSettings.videoPromptTemplate"
                class="setting-textarea"
                rows="6"
                placeholder="输入视频提示词模板..."
              />
              <p class="setting-hint">
                可用占位符：<code>{video_context}</code>、<code>{domain}</code>
              </p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="reset-btn" @click="emit('reset')">
              恢复默认
            </button>
            <div class="footer-right">
              <button class="cancel-btn" @click="handleClose">取消</button>
              <button class="save-btn" @click="handleSave">保存</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-panel {
  width: 520px;
  max-width: 100%;
  max-height: 85vh;
  background: var(--color-surface);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 16px;
}

.modal-title {
  font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 28px 16px;
}

.setting-group {
  margin-bottom: 18px;
}

.setting-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 6px;
}

.setting-input {
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 14px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.88rem;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
  box-shadow: var(--shadow-pressed);
}

.setting-input:focus {
  box-shadow: var(--shadow-pressed), 0 0 0 3px var(--color-accent-ring);
}

.setting-textarea {
  width: 100%;
  padding: 11px 16px;
  border: none;
  border-radius: 14px;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 0.85rem;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  outline: none;
  resize: vertical;
  transition: all 0.2s;
  box-sizing: border-box;
  line-height: 1.6;
  box-shadow: var(--shadow-pressed);
}

.setting-textarea:focus {
  box-shadow: var(--shadow-pressed), 0 0 0 3px var(--color-accent-ring);
}

.setting-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-top: 6px;
  line-height: 1.5;
}

.setting-hint code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--color-bg-hover);
  font-size: 0.8rem;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px 24px;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 14px;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-button);
}

.cancel-btn:hover {
  box-shadow: var(--shadow-button-hover);
}

.save-btn {
  padding: 10px 22px;
  border: none;
  border-radius: 14px;
  background: var(--color-accent);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px var(--color-accent-shadow);
}

.save-btn:hover {
  background: var(--color-accent-hover);
  box-shadow: 0 6px 18px var(--color-accent-shadow);
  transform: translateY(-1px);
}

.reset-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--color-danger);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: var(--color-danger-bg);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.95) translateY(12px);
}

@media (max-width: 600px) {
  .modal-panel { width: 100%; max-height: 90vh; }
}
</style>
