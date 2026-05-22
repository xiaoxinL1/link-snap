export interface ExtractedContent {
  title: string
  text: string
  domain: string
  type: 'article' | 'video'
}

export function extractDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname
  } catch {
    return url
  }
}

export function extractContent(html: string, sourceUrl: string): ExtractedContent {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const title =
    doc.querySelector('title')?.textContent?.trim() ||
    doc.querySelector('h1')?.textContent?.trim() ||
    extractDomain(sourceUrl)

  const domain = extractDomain(sourceUrl)

  for (const el of doc.querySelectorAll('script, style, nav, footer, header, iframe, noscript, aside, .sidebar, .nav, .footer, .header, .ad, .advertisement')) {
    el.remove()
  }

  const candidates: { element: Element; score: number }[] = []

  for (const el of doc.querySelectorAll('article, main, [role="main"], .post, .article, .content, .post-content, .article-content, .entry-content, .post-body')) {
    const text = el.textContent?.trim() || ''
    if (text.length > 100) {
      candidates.push({ element: el, score: text.length + 50 })
    }
  }

  for (const el of doc.querySelectorAll('section, .main, .container')) {
    const text = el.textContent?.trim() || ''
    if (text.length > 200) {
      candidates.push({ element: el, score: text.length })
    }
  }

  candidates.sort((a, b) => b.score - a.score)

  let bodyText = ''
  if (candidates.length > 0) {
    bodyText = candidates[0].element.textContent?.trim() || ''
  } else {
    bodyText = doc.body?.textContent?.trim() || ''
  }

  bodyText = bodyText
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/(\s*\n\s*){3,}/g, '\n\n')
    .trim()

  return { title, text: bodyText, domain, type: 'article' }
}
