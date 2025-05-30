/**
 * IndexNow API를 통해 URL을 검색엔진에 즉시 알리는 유틸리티 함수
 */

export async function notifyIndexNow(urls: string | string[]) {
  try {
    const urlArray = Array.isArray(urls) ? urls : [urls]
    
    // 개발 환경에서는 로그만 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('IndexNow (개발 모드):', urlArray)
      return { success: true, message: '개발 모드에서는 실제 호출하지 않음' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pickteum.com'}/api/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: urlArray }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('IndexNow 성공:', result)
      return result
    } else {
      console.error('IndexNow 실패:', response.status, response.statusText)
      return { success: false, error: 'API 호출 실패' }
    }
  } catch (error) {
    console.error('IndexNow 오류:', error)
    return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' }
  }
}

/**
 * 아티클 URL을 IndexNow에 알리는 함수
 */
export async function notifyArticleUpdate(articleId: string, slug?: string) {
  const url = slug 
    ? `https://www.pickteum.com/article/${slug}`
    : `https://www.pickteum.com/article/${articleId}`
  
  return notifyIndexNow(url)
}

/**
 * 여러 아티클 URL을 한 번에 IndexNow에 알리는 함수
 */
export async function notifyMultipleArticles(articles: Array<{ id: string; slug?: string }>) {
  const urls = articles.map(article => 
    article.slug 
      ? `https://www.pickteum.com/article/${article.slug}`
      : `https://www.pickteum.com/article/${article.id}`
  )
  
  return notifyIndexNow(urls)
}

/**
 * 사이트맵 업데이트를 IndexNow에 알리는 함수
 */
export async function notifySitemapUpdate() {
  const urls = [
    'https://www.pickteum.com/sitemap.xml',
    'https://www.pickteum.com/news-sitemap.xml',
    'https://www.pickteum.com/sitemap-index.xml'
  ]
  
  return notifyIndexNow(urls)
} 