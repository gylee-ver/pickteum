// 소셜 메타데이터 전용 유틸리티
export interface SocialMetaData {
  title: string
  description: string
  imageUrl: string
  url: string
  type: 'article' | 'website'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  content?: string // 키워드 추출용 콘텐츠 추가
  categoryName?: string // 카테고리명 추가
}

// 🔥 키워드 추출 함수 (검색엔진 최적화용)
export function extractKeywords(title: string, content?: string, categoryName?: string): string[] {
  const keywords = new Set<string>()
  
  // 기본 브랜드 키워드
  keywords.add('픽틈')
  keywords.add('뉴스')
  keywords.add('이슈')
  
  // 카테고리 키워드
  if (categoryName) {
    keywords.add(categoryName)
  }
  
  // 제목에서 중요 키워드 추출 (2글자 이상, 특수문자 제거)
  const titleWords = title
    .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    .split(/\s+/)
    .filter(word => word.length >= 2 && word.length <= 10)
    .slice(0, 5) // 최대 5개
  
  titleWords.forEach(word => keywords.add(word))
  
  // 🔥 콘텐츠에서 키워드 추출 강화
  if (content) {
    const contentText = content.replace(/<[^>]*>/g, '').replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    
    // 🔥 자주 등장하는 단어 우선 추출
    const wordFreq = new Map<string, number>()
    const contentWords = contentText
      .split(/\s+/)
      .filter(word => word.length >= 2 && word.length <= 8)
      .filter(word => !['이다', '있다', '되다', '하다', '것이다', '그리고', '하지만', '때문에'].includes(word))
    
    contentWords.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })
    
    // 빈도수 기준으로 상위 3개 키워드 추출
    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word)
    
    topWords.forEach(word => keywords.add(word))
  }
  
  return Array.from(keywords).slice(0, 12) // 🔥 키워드 수 증가 (10 → 12)
}

// 🔥 SEO 친화적 메타 설명 생성
export function generateSEODescription(originalDescription: string, title: string, categoryName?: string): string {
  if (!originalDescription || originalDescription.length < 20) {
    // 기본 설명이 없거나 너무 짧은 경우 개선된 설명 생성
    const category = categoryName ? ` ${categoryName}` : ''
    return `${title} | 틈새 시간을 이슈 충전 타임으로!${category} 관련 최신 뉴스와 정보를 픽틈에서 확인하세요.`
  }
  
  // 🔥 설명 품질 개선
  let cleanDescription = originalDescription.trim()
  
  // 불필요한 문구 제거
  cleanDescription = cleanDescription
    .replace(/^(픽틈|pickteum)\s*[-|]\s*/i, '')
    .replace(/\s*[-|]\s*(픽틈|pickteum)$/i, '')
  
  // 적절한 길이로 조정
  if (cleanDescription.length > 140) {
    // 문장 단위로 자르기 시도
    const sentences = cleanDescription.split(/[.!?]/)
    let result = ''
    for (const sentence of sentences) {
      if ((result + sentence).length <= 140) {
        result += sentence + '.'
      } else {
        break
      }
    }
    if (result.length < 50) { // 너무 짧으면 글자 수로 자르기
      result = cleanDescription.substring(0, 140) + '...'
    }
    cleanDescription = result
  }
  
  // 브랜드명 추가
  if (!cleanDescription.includes('픽틈')) {
    cleanDescription += (cleanDescription.endsWith('.') ? '' : '.') + ' | 픽틈'
  }
  
  return cleanDescription
}

export function generateSocialMeta(data: SocialMetaData) {
  // 🔥 이미지 URL 검증 및 절대경로 보장 강화
  let validImageUrl = 'https://www.pickteum.com/pickteum_og.png'
  
  if (data.imageUrl) {
    if (data.imageUrl.startsWith('http://') || data.imageUrl.startsWith('https://')) {
      // 이미 절대 URL인 경우
      validImageUrl = data.imageUrl
    } else if (data.imageUrl.startsWith('/')) {
      // 상대 경로인 경우 절대 URL로 변환
      validImageUrl = `https://www.pickteum.com${data.imageUrl}`
    } else {
      // 다른 형태의 경로인 경우
      validImageUrl = `https://www.pickteum.com/${data.imageUrl}`
    }
    
    // 🔥 소셜 미디어 크롤러를 위한 캐시 버스팅 매개변수 추가 (선택적)
    // 이미지가 업데이트되었지만 캐시 때문에 이전 이미지가 표시되는 경우를 방지
    if (!validImageUrl.includes('?') && !validImageUrl.includes('pickteum_og.png')) {
      // 기본 OG 이미지가 아닌 경우에만 캐시 버스팅 적용
      const timestamp = Math.floor(Date.now() / (1000 * 60 * 60)) // 1시간마다 변경
      validImageUrl += `?v=${timestamp}`
    }
  }

  // 제목과 설명 최적화
  const optimizedTitle = data.title?.trim() || '픽틈'
  const optimizedDescription = generateSEODescription(
    data.description || '틈새 시간을, 이슈 충전 타임으로!',
    optimizedTitle,
    data.categoryName
  )
  
  // 🔥 키워드 추출 (아티클인 경우에만)
  const keywords = data.type === 'article' ? 
    extractKeywords(optimizedTitle, data.content, data.categoryName) : 
    ['픽틈', '뉴스', '이슈']

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: keywords.join(', '), // 🔥 키워드 메타태그용
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      type: data.type,
      url: data.url,
      siteName: '픽틈',
      locale: 'ko_KR',
      images: [
        {
          url: validImageUrl,
          width: 1200,
          height: 630,
          alt: optimizedTitle,
          type: 'image/png',
        },
      ],
      ...(data.type === 'article' && {
        publishedTime: data.publishedTime,
        modifiedTime: data.modifiedTime,
        authors: data.author ? [data.author] : undefined,
        section: data.section,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      images: [validImageUrl],
      creator: '@pickteum',
      site: '@pickteum',
    },
  }
}

// 이미지 URL 검증 함수
export async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      },
      // 타임아웃 설정
      signal: AbortSignal.timeout(5000)
    })
    
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.startsWith('image/') || false)
  } catch (error) {
    console.warn('이미지 검증 실패:', imageUrl, error)
    return false
  }
}

// 기본 메타데이터 생성
export function getDefaultMetadata() {
  return generateSocialMeta({
    title: '픽틈 - 틈새시간을 이슈충전 타임으로',
    description: '틈새 시간을, 이슈 충전 타임으로!',
    imageUrl: 'https://www.pickteum.com/pickteum_og.png',
    url: 'https://www.pickteum.com',
    type: 'website'
  })
} 