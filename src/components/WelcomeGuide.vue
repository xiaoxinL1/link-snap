<script setup lang="ts">
</script>

<template>
  <div class="welcome-guide">
    <div class="guide-icon">
      <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
        <rect width="52" height="52" rx="16" fill="var(--color-surface)" />
        <path d="M17 21c0-3.314 2.686-6 6-6h6l4 8-4 8h-6a6 6 0 0 1-6-6v-4Z" fill="var(--color-accent)" opacity="0.35" />
        <path d="M35 21c0-3.314-2.686-6-6-6h-6l-4 8 4 8h6a6 6 0 0 0 6-6v-4Z" fill="var(--color-accent)" opacity="0.2" />
        <rect x="23" y="16" width="6" height="20" rx="2" fill="var(--color-accent)" opacity="0.28" />
      </svg>
    </div>
    <h2 class="guide-title">快速获取网页核心内容</h2>
    <p class="guide-desc">
      粘贴任意文章、报告或新闻链接，LinkSnap 将自动提取正文，<br />
      调用 AI 为您生成结构化的中文摘要。
    </p>
    <div class="guide-features">
      <div class="feature">
        <div class="feature-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <span>智能提取正文</span>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <span>结构化摘要</span>
      </div>
      <div class="feature">
        <div class="feature-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <span>历史记录保存</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-guide {
  text-align: center;
  padding: 48px 24px;
}

.guide-icon { margin-bottom: 24px; }

.guide-title {
  font-family: 'Playfair Display', 'Noto Serif SC', Georgia, serif;
  font-size: 1.45rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}

.guide-desc {
  font-size: 0.92rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
  margin: 0 0 32px;
}

.guide-features {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: var(--shadow-button);
  transition: transform 0.2s ease;
}

.feature:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button-hover);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  color: var(--color-accent);
}

@media (max-width: 600px) {
  .welcome-guide { padding: 32px 16px; }
  .guide-title { font-size: 1.2rem; }
  .guide-features { flex-direction: column; gap: 10px; }
  .feature { width: 100%; justify-content: center; }
}
</style>
