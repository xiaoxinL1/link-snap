import { ref } from 'vue'
import { extractContent, extractDomain } from '../utils/readability'
import { isVideoUrl, extractVideoMeta, buildVideoContext } from '../utils/video'
import { fetchYoutubeTranscript, fetchBilibiliSubtitle, extractVideoId } from '../utils/transcript'
import { useHistory } from './useHistory'
import type { Settings } from './useSettings'
import { parseShareText, type ShareInfo } from '../utils/share'

export interface SummaryResult {
  title: string
  domain: string
  summary: string
  rawText: string
  url: string
  type: 'article' | 'video'
  hasTranscript: boolean
}

type Status = 'idle' | 'fetching' | 'extracting' | 'transcribing' | 'summarizing' | 'done'

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
]

const VIDEO_CORS_PROXIES = [
  ...CORS_PROXIES,
  'https://cors-anywhere.herokuapp.com/',
]

const MAX_CONTENT_LENGTH = 4000
const VIDEO_MIN_CONTENT_LENGTH = 5
const REQUEST_TIMEOUT = 15000

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}

async function fetchHtml(url: string, minLength: number = 50): Promise<string> {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetchWithTimeout(proxy + encodeURIComponent(url), REQUEST_TIMEOUT)
      if (!res.ok) continue
      const text = await res.text()
      if (text.length < minLength) continue
      return text
    } catch {
      continue
    }
  }
  throw new Error('所有代理服务均不可用，请稍后重试或检查链接是否可访问')
}

async function fetchVideoHtml(url: string): Promise<string> {
  for (const proxy of VIDEO_CORS_PROXIES) {
    try {
      const res = await fetchWithTimeout(proxy + encodeURIComponent(url), REQUEST_TIMEOUT)
      if (!res.ok) continue
      const text = await res.text()
      if (text.length > 10) return text
    } catch {
      continue
    }
  }
  throw new Error('所有代理服务均不可用，请稍后重试或检查链接是否可访问')
}

async function fetchYoutubeOembed(videoId: string): Promise<string | null> {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  try {
    const res = await fetchWithTimeout(oembedUrl, 10000)
    if (!res.ok) return null
    const data = await res.json()
    const title = data.title || ''
    const author = data.author_name || ''
    const desc = ''
    const html = `<!DOCTYPE html><html><head>
<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
<meta name="author" content="${author.replace(/"/g, '&quot;')}" />
<meta property="og:description" content="${desc}" />
<title>${title}</title></head><body></body></html>`
    return html
  } catch {
    return null
  }
}

async function fetchBilibiliApiMeta(bvid: string): Promise<string | null> {
  const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetchWithTimeout(proxy + encodeURIComponent(apiUrl), 12000)
      if (!res.ok) continue
      const json = await res.json()
      const data = json?.data
      if (!data) continue
      const title = data.title || ''
      const desc = data.desc || ''
      const owner = data?.owner?.name || ''
      const tags = (data?.tag || []).map((t: { tag_name?: string }) => t.tag_name).filter(Boolean).join(',')
      const html = `<!DOCTYPE html><html><head>
<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
<meta name="description" content="${desc.replace(/"/g, '&quot;')}" />
<meta name="author" content="${owner.replace(/"/g, '&quot;')}" />
<meta name="keywords" content="${tags}" />
<title>${title}</title></head><body></body></html>`
      return html
    } catch {
      continue
    }
  }
  return null
}

async function callAI(content: string, settings: Settings): Promise<string> {
  if (!settings.apiKey) {
    throw new Error('请先在设置中配置 API Key')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch(settings.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [{ role: 'user', content }],
        max_tokens: settings.maxTokens,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(
        (err as { error?: { message?: string } }).error?.message ||
          `API 请求失败 (${res.status})，请检查配置`
      )
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) throw new Error('AI 返回结果为空，请重试')

    return text
  } finally {
    clearTimeout(timer)
  }
}

export function useSummary() {
  const status = ref<Status>('idle')
  const error = ref<string>('')
  const result = ref<SummaryResult | null>(null)
  const { addItem } = useHistory()

  async function summarize(input: string, settings: Settings) {
    let url: string
    let shareMeta: { description: string; hashtags: string[] } | null = null

    const shareInfo = parseShareText(input.trim())
    if (shareInfo && shareInfo.isShare) {
      url = shareInfo.url
      shareMeta = { description: shareInfo.description, hashtags: shareInfo.hashtags }
    } else {
      url = input.trim()
    }

    if (!isValidUrl(url)) {
      error.value = '请输入有效的链接（以 http:// 或 https:// 开头，或粘贴抖音分享文案自动识别）'
      return
    }

    error.value = ''
    result.value = null

    const isVideo = isVideoUrl(url)

    try {
      status.value = 'fetching'
      let html: string

      if (isVideo) {
        html = await fetchVideoHtml(url).catch(async () => {
          const vidInfo = extractVideoId(url)
          if (!vidInfo) throw new Error('无法识别视频平台')

          if (vidInfo.platform === 'youtube') {
            const oembedHtml = await fetchYoutubeOembed(vidInfo.id)
            if (oembedHtml) return oembedHtml
          } else if (vidInfo.platform === 'bilibili') {
            const apiHtml = await fetchBilibiliApiMeta(vidInfo.id)
            if (apiHtml) return apiHtml
          }

          throw new Error('所有代理服务均不可用，请稍后重试或检查链接是否可访问')
        })
      } else {
        html = await fetchHtml(url)
      }

      status.value = 'extracting'
      let prompt: string
      let extractedTitle: string
      let extractedDomain: string
      let rawTextContent: string
      let hasTranscript = false

      if (isVideo) {
        const meta = extractVideoMeta(html, url)
        extractedTitle = meta.title
        extractedDomain = extractDomainFromUrl(url)

        if (!extractedTitle) {
          const doc = new DOMParser().parseFromString(html, 'text/html')
          extractedTitle = doc.querySelector('title')?.textContent?.trim() || extractDomain(url)
        }

        if (shareMeta && shareMeta.description) {
          if (!extractedTitle || extractedTitle === extractDomain(url)) {
            extractedTitle = shareMeta.description.length > 50
              ? shareMeta.description.slice(0, 50) + '…'
              : shareMeta.description
          }
          if (!meta.description) {
            meta.description = shareMeta.description
          }
          if (shareMeta.hashtags.length > 0) {
            meta.tags = [...new Set([...meta.tags, ...shareMeta.hashtags])]
          }
        }

        status.value = 'transcribing'
        const vidInfo = extractVideoId(url)
        if (vidInfo) {
          try {
            let transcriptResult = null
            if (vidInfo.platform === 'youtube') {
              transcriptResult = await fetchYoutubeTranscript(url)
            } else if (vidInfo.platform === 'bilibili') {
              transcriptResult = await fetchBilibiliSubtitle(url, html)
            }

            if (transcriptResult && transcriptResult.transcript.length > 30) {
              meta.transcript = transcriptResult.transcript
              hasTranscript = true
            }
          } catch { /* no transcript, use metadata fallback */ }
        }

        rawTextContent = buildVideoContext(meta)

        if (shareMeta && shareMeta.description) {
          const shareParts: string[] = []
          shareParts.push(`分享文案描述：${shareMeta.description}`)
          if (shareMeta.hashtags.length > 0) {
            shareParts.push(`分享话题标签：${shareMeta.hashtags.join('、')}`)
          }
          rawTextContent = shareParts.join('\n') + '\n\n' + rawTextContent
        }

        if (!hasTranscript && rawTextContent.length < VIDEO_MIN_CONTENT_LENGTH && extractedTitle) {
          rawTextContent = `视频标题：${extractedTitle}\n（该页面为 JS 动态渲染页面，CORS 代理仅获取到骨骼 HTML，元数据极少）`
        }

        if (rawTextContent.length < VIDEO_MIN_CONTENT_LENGTH) {
          error.value = '无法提取该视频页面的任何有效信息（页面可能为纯 JS 渲染，或链接不可访问）'
          status.value = 'idle'
          return
        }

        prompt = settings.videoPromptTemplate
          .replace('{video_context}', rawTextContent)
          .replace('{domain}', extractedDomain)
          .replace(
            '由于无法获取视频画面和语音内容，请仅根据标题、简介和标签等信息进行分析总结。',
            hasTranscript
              ? '以下为该视频的字幕/文案内容，请基于完整的视频内容生成总结。'
              : shareMeta
                ? '以下为该视频的分享文案及元数据信息。分享文案中已包含视频的核心描述和话题标签，请重点依据分享文案进行总结。'
                : '由于无法获取视频画面和语音内容，请仅根据标题、简介和标签等信息进行分析总结。'
          )
      } else {
        const extracted = extractContent(html, url)
        extractedTitle = extracted.title
        extractedDomain = extracted.domain
        rawTextContent = extracted.text

        if (rawTextContent.length < 100) {
          error.value = '无法提取有效正文内容（内容过短或页面为空）'
          status.value = 'idle'
          return
        }

        const truncatedText =
          rawTextContent.length > MAX_CONTENT_LENGTH
            ? rawTextContent.slice(0, MAX_CONTENT_LENGTH) + '…'
            : rawTextContent

        prompt = settings.promptTemplate
          .replace('{title}', extractedTitle)
          .replace('{domain}', extractedDomain)
          .replace('{content}', truncatedText)
      }

      status.value = 'summarizing'
      const summary = await callAI(prompt, settings)

      status.value = 'done'
      result.value = {
        title: extractedTitle,
        domain: extractedDomain,
        summary,
        rawText: rawTextContent,
        url,
        type: isVideo ? 'video' : 'article',
        hasTranscript,
      }

      addItem({
        url,
        title: extractedTitle,
        domain: extractedDomain,
        summary,
        rawText: rawTextContent,
        type: isVideo ? 'video' : 'article',
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : '发生未知错误，请重试'
      status.value = 'idle'
    }
  }

  function reset() {
    status.value = 'idle'
    error.value = ''
    result.value = null
  }

  return {
    status,
    error,
    result,
    summarize,
    reset,
    isValidUrl,
  }
}

function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
