# LinkSnap

**LinkSnap** — 智能链接摘要工具。粘贴任意网页链接或抖音分享文案，一键生成结构化中文总结。

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square)

## ✨ 功能特性

### 📄 文章摘要
- 粘贴任意网页 URL，自动提取正文内容
- 基于 AI（DeepSeek / OpenAI 兼容接口）生成结构化中文总结
- 支持 Markdown 渲染，一键复制结果

### 🎬 视频总结
- **YouTube** — 自动抓取视频字幕/转录，生成完整内容总结
- **B站 (bilibili)** — 获取 BV 号对应字幕，支持双语字幕
- **抖音 / 抖音分享文案** 🆕 — 直接粘贴抖音复制的分享文本，自动识别链接、描述和话题标签
- **西瓜视频 / 快手 / 小红书** — 提取页面元数据生成总结

### 🔗 抖音分享文案智能解析
粘贴类似以下格式的抖音分享文本，自动提取核心信息：

```
9.97 t@R.KJ 12/06 AGV:/ :1pm 在贵阳吃地道「铁板烧」～人生中没吃到过的好味道 #凯迪仕智能锁 #南北早餐争霸赛 https://v.douyin.com/PD-MavWBrXA/ 复制此链接，打开Dou音搜索，直接观看视频！
```

系统会自动：
1. **识别并提取** `https://v.douyin.com/...` 链接
2. **解析** 视频描述文字（"在贵阳吃地道铁板烧…"）
3. **收集** 话题标签（#凯迪仕智能锁 #南北早餐争霸赛）
4. 将以上信息作为**增强上下文**注入 AI 总结流程

### ⚙️ 可定制配置
- 自定义 API Endpoint（兼容 OpenAI 格式）
- 自定义 Prompt 模板（文章 / 视频分别可配）
- 调整模型名称与最大 Token 数

### 💾 历史记录
- 本地存储所有生成的摘要，支持查看、删除、清空
- 支持重新生成已有链接的摘要

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm / pnpm / yarn
- 一个 AI API Key（默认使用 DeepSeek）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/<your-username>/link-snap.git
cd link-snap

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 配置 AI 接口

启动后点击右上角 ⚙️ 设置按钮，填入：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| API Endpoint | `https://api.deepseek.com/chat/completions` | OpenAI 兼容的 Chat Completions 接口 |
| API Key | — | 你的 API 密钥 |
| Model | `deepseek-chat` | 使用的模型名称 |
| Max Tokens | `800` | 最大输出 Token 数 |

> 也支持接入 OpenAI、Ollama、本地部署的 LLM 等任何兼容 `/chat/completions` 格式的服务。

## 🏗️ 项目结构

```
src/
├── components/
│   ├── AppHeader.vue          # 顶部导航栏
│   ├── UrlInput.vue           # URL / 分享文案输入框
│   ├── SummaryCard.vue        # 摘要结果卡片（含复制/预览/重生成）
│   ├── SourcePreview.vue      # 原文/元数据预览
│   ├── WelcomeGuide.vue       # 首页引导
│   ├── HistoryDrawer.vue      # 历史记录抽屉
│   ├── HistoryItem.vue        # 历史记录条目
│   ├── SettingsPanel.vue      # 设置面板
│   └── ParticleBackground.vue # 粒子动画背景
├── composables/
│   ├── useSummary.ts          # 核心摘要逻辑（含分享文案解析）
│   ├── useHistory.ts          # 历史记录管理
│   ├── useSettings.ts         # 用户设置管理
│   └── useTheme.ts            # 主题切换
└── utils/
    ├── readability.ts         # 文章正文提取器
    ├── video.ts               # 多平台视频元数据提取
    ├── transcript.ts          # YouTube / B站字幕获取
    ├── share.ts               # 抖音分享文案解析器 🆕
    └── storage.ts             # localStorage 封装
```

## 🧠 核心技术

- **前端框架**: Vue 3 Composition API + `<script setup>`
- **构建工具**: Vite 6 + TypeScript 5.7
- **AI 对话**: OpenAI Chat Completions API 兼容格式
- **内容提取**: 自研 Readability-like 正文提取算法
- **CORS 代理**: allorigins / corsproxy 双代理轮询
- **Markdown 渲染**: marked.js
- **状态持久化**: localStorage

## 📝 使用示例

### 普通文章链接
```
https://example.com/article/some-interesting-post
```

### YouTube 视频
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### B站视频
```
https://www.bilibili.com/video/BV1xx411c7mU
```

### 抖音分享文案（直接粘贴整段文本）
```
9.97 t@R.KJ 12/06 AGV:/ 在贵阳吃地道「铁板烧」～ https://v.douyin.com/PD-MavWBrXA/ 复制此链接，打开Dou音搜索，直接观看视频！
```

## License

MIT
