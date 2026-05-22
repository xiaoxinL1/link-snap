import { ref } from 'vue'
import { getItem, setItem } from '../utils/storage'

export interface Settings {
  apiEndpoint: string
  apiKey: string
  model: string
  promptTemplate: string
  videoPromptTemplate: string
  maxTokens: number
  visionEnabled: boolean
  visionApiEndpoint: string
  visionApiKey: string
  visionModel: string
  visionPromptTemplate: string
}

const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'https://api.deepseek.com/chat/completions',
  apiKey: '',
  model: 'deepseek-chat',
  promptTemplate: '请对以下网页内容生成简洁、准确的中文总结。要求结构化输出：\n\n【核心主题】\n{core_theme}\n\n【关键要点】\n- 要点1\n- 要点2\n\n【结论/启发】\n{conclusion}\n\n限制输出在300-500字以内。\n\n网页标题：{title}\n网页来源：{domain}\n\n网页正文：\n{content}',
  videoPromptTemplate: '请根据以下短视频的元数据信息，生成一份简洁、准确的中文总结。由于无法获取视频画面和语音内容，请仅根据标题、简介和标签等信息进行分析总结。\n\n要求结构化输出：\n\n【视频概要】\n简要概括该视频可能讨论的主题和内容方向\n\n【要点推测】\n- 基于标题和标签，列出视频可能涵盖的关键点\n- 结合简介内容，补充可能的细节\n\n【适合人群/启发】\n该视频可能对哪类观众有帮助，或能带来什么启发\n\n限制输出在300-500字以内。\n\n{video_context}\n网页来源：{domain}',
  maxTokens: 800,
  visionEnabled: true,
  visionApiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  visionApiKey: '',
  visionModel: 'glm-4v-plus',
  visionPromptTemplate: '你是一个专业的视频内容分析师。请根据以下视频封面截图和元数据信息，直接「观看」视频画面后，生成一份准确、详细的中文总结。\n\n要求结构化输出：\n\n【视频画面分析】\n根据封面图描述视频的视觉内容（场景、人物、动作、风格等）\n\n【内容概要】\n综合画面信息和文字元数据，概括视频的核心内容和主题\n\n【关键要点】\n- 要点1\n- 要点2\n- 要点3\n\n【适合人群/价值】\n该视频对哪类观众有价值，能带来什么启发或帮助\n\n限制输出在300-500字以内。\n\n以下是视频的视觉画面和元数据信息：\n{video_context}\n网页来源：{domain}',
}

const OLD_OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const OLD_OPENAI_MODEL = 'gpt-3.5-turbo'

function loadSettings(): Settings {
  const saved = getItem<Partial<Settings>>('settings', {})
  let needsMigration = false

  if (saved.apiEndpoint === OLD_OPENAI_ENDPOINT) {
    saved.apiEndpoint = DEFAULT_SETTINGS.apiEndpoint
    needsMigration = true
  }
  if (saved.model === OLD_OPENAI_MODEL) {
    saved.model = DEFAULT_SETTINGS.model
    needsMigration = true
  }

  const merged = { ...DEFAULT_SETTINGS, ...saved }

  if (needsMigration) {
    setItem('settings', merged)
  }

  return merged
}

const settings = ref<Settings>(loadSettings())

export function useSettings() {
  function updateSettings(partial: Partial<Settings>) {
    settings.value = { ...settings.value, ...partial }
    setItem('settings', settings.value)
  }

  function resetSettings() {
    settings.value = { ...DEFAULT_SETTINGS }
    setItem('settings', settings.value)
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    DEFAULT_SETTINGS,
  }
}
