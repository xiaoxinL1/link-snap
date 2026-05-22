export interface TranscriptResult {
  transcript: string
  language: string
}

const TRANSCRIPT_TIMEOUT = 12000

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TRANSCRIPT_TIMEOUT)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TRANSCRIPT_TIMEOUT)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function proxyFetchText(url: string): Promise<string | null> {
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ]
  for (const proxy of proxies) {
    try {
      const text = await fetchText(proxy + encodeURIComponent(url))
      if (text && text.length > 10) return text
    } catch { /* try next */ }
  }
  return null
}

function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export async function fetchYoutubeTranscript(url: string): Promise<TranscriptResult | null> {
  const videoId = extractYoutubeVideoId(url)
  if (!videoId) return null

  const transcriptText = await proxyFetchText(
    `https://youtubetranscript.com/?v=${videoId}`
  )
  if (transcriptText && transcriptText.trim().length > 50) {
    return {
      transcript: transcriptText
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
      language: 'auto',
    }
  }

  const xmlUrl = `https://youtubetranscript.com/?v=${videoId}&format=xml`
  const xml = await proxyFetchText(xmlUrl)
  if (xml) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml')
    const texts: string[] = []
    for (const el of doc.querySelectorAll('text')) {
      const t = el.textContent?.trim()
      if (t) texts.push(t)
    }
    if (texts.length > 0) {
      return {
        transcript: texts.join('\n'),
        language: 'auto',
      }
    }
  }

  return null
}

function extractBilibiliBvid(url: string): string | null {
  const m = url.match(/\/video\/(BV[a-zA-Z0-9]+)/)
  return m ? m[1] : null
}

export async function fetchBilibiliSubtitle(url: string, pageHtml: string): Promise<TranscriptResult | null> {
  const bvid = extractBilibiliBvid(url)
  if (!bvid) return null

  try {
    const match = pageHtml.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});\s*\(function/)
    if (match) {
      const state = JSON.parse(match[1])
      const subtitle = state?.videoData?.subtitle?.list?.[0]
      if (subtitle?.subtitle_url) {
        let subtitleUrl = subtitle.subtitle_url
        if (subtitleUrl.startsWith('//')) subtitleUrl = 'https:' + subtitleUrl

        const json = await proxyFetchText(subtitleUrl)
        if (json) {
          try {
            const data = JSON.parse(json)
            const texts = (data?.body || [])
              .map((item: { content?: string }) => item.content || '')
              .filter((t: string) => t.trim())
            if (texts.length > 0) {
              return {
                transcript: texts.join('\n'),
                language: subtitle?.lan_doc || 'zh',
              }
            }
          } catch { /* fall through */ }
        }
      }
    }
  } catch { /* fall through */ }

  try {
    const viewData = await proxyFetchText(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    )
    if (viewData) {
      const viewJson = JSON.parse(viewData)
      const cid = viewJson?.data?.cid
      if (cid) {
        const playerData = await proxyFetchText(
          `https://api.bilibili.com/x/player/v2?bvid=${bvid}&cid=${cid}`
        )
        if (playerData) {
          const playerJson = JSON.parse(playerData)
          const subtitles = playerJson?.data?.subtitle?.subtitles
          if (subtitles?.length > 0) {
            let subtitleUrl = subtitles[0].subtitle_url
            if (subtitleUrl.startsWith('//')) subtitleUrl = 'https:' + subtitleUrl

            const subData = await proxyFetchText(subtitleUrl)
            if (subData) {
              const subJson = JSON.parse(subData)
              const texts = (subJson?.body || [])
                .map((item: { content?: string }) => item.content || '')
                .filter((t: string) => t.trim())
              if (texts.length > 0) {
                return {
                  transcript: texts.join('\n'),
                  language: subtitles[0]?.lan_doc || 'auto',
                }
              }
            }
          }
        }
      }
    }
  } catch { /* no transcript available */ }

  return null
}

export function extractVideoId(url: string): { platform: string; id: string } | null {
  const yt = extractYoutubeVideoId(url)
  if (yt) return { platform: 'youtube', id: yt }

  const bl = extractBilibiliBvid(url)
  if (bl) return { platform: 'bilibili', id: bl }

  return null
}
