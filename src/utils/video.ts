export interface VideoMeta {
  title: string
  description: string
  channel: string
  tags: string[]
  transcript: string
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^\s*[-–—|]+\s*/, '')
    .replace(/\s*[-–—|]+\s*$/, '')
    .replace(/["""]/g, '"')
    .replace(/[''']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanText(raw: string): string {
  return raw
    .replace(/["""]/g, '"')
    .replace(/[''']/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function getMetaContent(doc: Document, selectors: string[]): string {
  for (const sel of selectors) {
    const el = doc.querySelector(sel)
    const content = el?.getAttribute('content') || el?.textContent
    if (content?.trim()) return content.trim()
  }
  return ''
}

function getOgDescription(doc: Document): string {
  return doc.querySelector('meta[property="og:description"]')?.getAttribute('content')
    || doc.querySelector('meta[name="og:description"]')?.getAttribute('content')
    || ''
}

function getOgTitle(doc: Document): string {
  return doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || ''
}

function getKeywords(doc: Document): string {
  return getMetaContent(doc, ['meta[name="keywords"]', 'meta[property="article:tag"]'])
}

function fallbackBodyText(doc: Document, maxLen: number = 500): string {
  for (const el of doc.querySelectorAll('script, style, nav, footer, header, iframe, noscript, aside')) {
    el.remove()
  }
  const text = (doc.body?.textContent || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/(\s*\n\s*){3,}/g, '\n\n')
    .trim()
  return text.slice(0, maxLen)
}

const VIDEO_PLATFORMS: { hostPattern: RegExp; extract: (doc: Document) => VideoMeta }[] = [
  {
    hostPattern: /(youtube\.com|youtu\.be)/i,
    extract: (doc) => {
      const title = getMetaContent(doc, [
        'meta[name="title"]',
        'meta[property="og:title"]',
      ]) || doc.querySelector('title')?.textContent?.replace(/ - YouTube$/, '').trim() || ''

      let description = ''
      try {
        for (const s of doc.querySelectorAll('script[type="application/ld+json"]')) {
          try {
            const json = JSON.parse(s.textContent || '')
            const item = (json?.['@graph']?.find?.((g: { '@type'?: string }) => g['@type'] === 'VideoObject'))
              || (json['@type'] === 'VideoObject' ? json : null)
            if (item?.description) description = item.description
          } catch { /* skip */ }
        }
      } catch { /* skip */ }

      if (!description) description = getMetaContent(doc, [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ])

      if (!description && title.length > 0) {
        description = '（该视频页面仅返回了骨骼 HTML，无法获取完整简介。以下为页面可见文本片段）\n' + fallbackBodyText(doc)
      } else if (!description) {
        description = fallbackBodyText(doc)
      }

      const channel = getMetaContent(doc, [
        'link[itemprop="name"]',
        'meta[name="author"]',
      ])

      const keywords = getKeywords(doc)
      const tags = keywords.split(',').map((t) => t.trim()).filter((t) => t.length > 0)

      return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
    },
  },
  {
    hostPattern: /bilibili\.com|b23\.tv/i,
    extract: (doc) => {
      const rawTitle = doc.querySelector('title')?.textContent || ''
      let title = rawTitle.replace(/(_哔哩哔哩_bilibili|-\s*哔哩哔哩.*)$/, '').trim()

      let description = getMetaContent(doc, [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ])

      const ogTitle = getOgTitle(doc)
      if (!title && ogTitle) title = ogTitle

      const channel = getMetaContent(doc, ['meta[name="author"]'])

      if (!description) {
        description = fallbackBodyText(doc)
      }

      const keywords = getKeywords(doc)
      const tags = keywords.split(',').map((t) => t.trim()).filter((t) => t.length > 0)

      return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
    },
  },
  {
    hostPattern: /douyin\.com|tiktok\.com/i,
    extract: (doc) => {
      const rawTitle = doc.querySelector('title')?.textContent || ''
      let title = rawTitle.replace(/\s*[-–—]\s*抖音\s*$/i, '').trim() || rawTitle
      const ogTitle = getOgTitle(doc)
      if (!title && ogTitle) title = ogTitle

      let description = getMetaContent(doc, [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ])
      if (!description) description = fallbackBodyText(doc)

      const channel = getMetaContent(doc, ['meta[name="author"]'])
      const keywords = getKeywords(doc)
      const tags = keywords.split(',').map((t) => t.trim()).filter((t) => t.length > 0)

      return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
    },
  },
  {
    hostPattern: /ixigua\.com|xigua\.com/i,
    extract: (doc) => {
      let title = doc.querySelector('title')?.textContent?.replace(/[-–—]\s*西瓜视频\s*$/i, '').trim() || ''
      const ogTitle = getOgTitle(doc)
      if (!title && ogTitle) title = ogTitle

      let description = getMetaContent(doc, [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ])
      if (!description) description = fallbackBodyText(doc)

      const channel = getMetaContent(doc, ['meta[name="author"]'])
      const tags: string[] = []

      return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
    },
  },
  {
    hostPattern: /kuaishou\.com/i,
    extract: (doc) => {
      let title = doc.querySelector('title')?.textContent?.replace(/[-–—]\s*快手\s*$/i, '').trim() || ''
      const ogTitle = getOgTitle(doc)
      if (!title && ogTitle) title = ogTitle

      let description = getMetaContent(doc, [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ])
      if (!description) description = fallbackBodyText(doc)

      const channel = getMetaContent(doc, ['meta[name="author"]'])
      const tags: string[] = []

      return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
    },
  },
  {
    hostPattern: /xhslink\.com|xiaohongshu\.com/i,
    extract: (doc) => {
      let title = doc.querySelector('title')?.textContent?.replace(/[-–—]\s*小红书\s*$/i, '').trim() || ''
      const ogTitle = getOgTitle(doc)
      if (!title && ogTitle) title = ogTitle

      let description = getMetaContent(doc, [
        'meta[name="description"]',
        'meta[property="og:description"]',
      ])
      if (!description) description = fallbackBodyText(doc)

      const channel = getMetaContent(doc, ['meta[name="author"]'])
      const tags: string[] = []

      return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
    },
  },
]

export function isVideoUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname
    return VIDEO_PLATFORMS.some((p) => p.hostPattern.test(hostname))
  } catch {
    return false
  }
}

export function extractVideoMeta(html: string, url: string): VideoMeta {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const hostname = extractHostname(url)

  const platform = VIDEO_PLATFORMS.find((p) => p.hostPattern.test(hostname))
  if (platform) {
    return platform.extract(doc)
  }

  const title =
    doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    doc.querySelector('title')?.textContent?.trim() ||
    ''
  const description =
    doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
    doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
    fallbackBodyText(doc)
  const channel =
    doc.querySelector('meta[name="author"]')?.getAttribute('content') || ''
  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || ''
  const tags = keywords.split(',').map((t) => t.trim()).filter((t) => t.length > 0)

  return { title: cleanTitle(title), description: cleanText(description), channel, tags, transcript: '' }
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

export function buildVideoContext(meta: VideoMeta): string {
  const parts: string[] = []

  if (meta.transcript) {
    parts.push(`视频字幕/转录：${meta.transcript}`)
  }

  if (meta.title) parts.push(`视频标题：${meta.title}`)
  if (meta.channel) parts.push(`创作者/频道：${meta.channel}`)
  if (meta.tags.length > 0) parts.push(`标签：${meta.tags.join('、')}`)
  if (meta.description) parts.push(`视频简介：${meta.description}`)
  return parts.join('\n')
}
