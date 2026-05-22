export interface ShareInfo {
  url: string
  description: string
  hashtags: string[]
  isShare: boolean
}

function extractUrl(text: string): string | null {
  const urlRegex = /https?:\/\/[^\s]+/g
  const matches = text.match(urlRegex)
  if (!matches || matches.length === 0) return null
  return matches[matches.length - 1]
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#\s*([^#\s]+)/g
  const tags: string[] = []
  let match
  while ((match = hashtagRegex.exec(text)) !== null) {
    const tag = match[1].trim()
    if (tag && !tags.includes(tag)) {
      tags.push(tag)
    }
  }
  return tags
}

const DOUYIN_BOILERPLATE = [
  /复制此链接[，,]?\s*打开\S+搜索[，,]?\s*直接观看视频[！!]\s*/i,
  /复制此链接[，,]?\s*打开\S+[，,]?\s*直接观看视频[！!]\s*/i,
]

function extractDescription(text: string, url: string): string {
  let desc = text.replace(url, '')

  for (const pattern of DOUYIN_BOILERPLATE) {
    desc = desc.replace(pattern, '')
  }

  desc = desc.replace(/^\d+\.?\d*\s+\S+@\S+\s+\d+\/\d+\s+\S+:\/\s*:?\S*\s*/i, '')

  desc = desc.replace(/#/g, '')

  desc = desc.replace(/\s{2,}/g, ' ').trim()

  return desc
}

export function parseShareText(input: string): ShareInfo | null {
  const url = extractUrl(input)
  if (!url) return null

  const hashtags = extractHashtags(input)
  const description = extractDescription(input, url)

  if (!description && hashtags.length === 0) {
    return { url, description: '', hashtags: [], isShare: false }
  }

  return { url, description, hashtags, isShare: true }
}