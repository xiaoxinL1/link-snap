export interface VisionImage {
  base64: string
  mimeType: string
}

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://api.codetabs.com/v1/proxy?quest=',
]

const IMAGE_TIMEOUT = 12000

function getYoutubeThumbnailUrls(videoId: string): string[] {
  return [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  ]
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function imageToBase64Direct(url: string): Promise<VisionImage | null> {
  try {
    const res = await fetchWithTimeout(url, IMAGE_TIMEOUT)
    if (!res.ok) return null
    const blob = await res.blob()
    if (blob.size < 1000) return null
    const mimeType = blob.type || 'image/jpeg'
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve({ base64, mimeType })
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function imageToBase64ViaProxy(url: string): Promise<VisionImage | null> {
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetchWithTimeout(proxy + encodeURIComponent(url), IMAGE_TIMEOUT)
      if (!res.ok) continue
      const blob = await res.blob()
      if (blob.size < 1000 || !blob.type.startsWith('image/')) continue
      const mimeType = blob.type
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve({ base64, mimeType })
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      continue
    }
  }
  return null
}

export async function imageToBase64(url: string): Promise<VisionImage | null> {
  const direct = await imageToBase64Direct(url)
  if (direct) return direct
  return imageToBase64ViaProxy(url)
}

export async function extractVideoCover(url: string, html?: string): Promise<string[]> {
  const covers: string[] = []

  try {
    const hostname = new URL(url).hostname.toLowerCase()
    const ytMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (ytMatch && (hostname.includes('youtube') || hostname.includes('youtu.be'))) {
      const urls = getYoutubeThumbnailUrls(ytMatch[1])
      for (const u of urls) {
        const img = await imageToBase64(u)
        if (img) {
          covers.push(`data:${img.mimeType};base64,${img.base64}`)
          break
        }
      }
      return covers
    }

    if (hostname.includes('bilibili') || hostname.includes('b23.tv')) {
      const bvidMatch = url.match(/\/video\/(BV[a-zA-Z0-9]+)/)
      if (bvidMatch) {
        const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvidMatch[1]}`
        for (const proxy of CORS_PROXIES) {
          try {
            const res = await fetchWithTimeout(proxy + encodeURIComponent(apiUrl), 12000)
            if (!res.ok) continue
            const json = await res.json()
            const picUrl = json?.data?.pic
            if (picUrl) {
              const img = await imageToBase64(picUrl)
              if (img) {
                covers.push(`data:${img.mimeType};base64,${img.base64}`)
              }
            }
            break
          } catch { continue }
        }
      }

      if (html) {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
        if (ogImg && !covers.length) {
          let picUrl = ogImg
          if (picUrl.startsWith('//')) picUrl = 'https:' + picUrl
          const img = await imageToBase64(picUrl)
          if (img) covers.push(`data:${img.mimeType};base64,${img.base64}`)
        }
      }

      return covers
    }

    if (hostname.includes('douyin') || hostname.includes('tiktok')) {
      if (html) {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        const ogImg = doc.querySelector('meta[property="og:image"]')?.getAttribute('content')
        if (ogImg) {
          let picUrl = ogImg
          if (picUrl.startsWith('//')) picUrl = 'https:' + picUrl
          const img = await imageToBase64(picUrl)
          if (img) covers.push(`data:${img.mimeType};base64,${img.base64}`)
        }
      }
      return covers
    }

    if (html) {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const candidates = [
        doc.querySelector('meta[property="og:image"]')?.getAttribute('content'),
        doc.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
        doc.querySelector('link[rel="image_src"]')?.getAttribute('href'),
      ]
      for (const src of candidates) {
        if (!src) continue
        let picUrl = src
        if (picUrl.startsWith('//')) picUrl = 'https:' + picUrl
        const img = await imageToBase64(picUrl)
        if (img) {
          covers.push(`data:${img.mimeType};base64,${img.base64}`)
          break
        }
      }
    }
  } catch {
    // ignore extraction errors
  }

  return covers
}