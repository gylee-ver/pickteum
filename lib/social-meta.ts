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
  
  // 콘텐츠에서 키워드 추출 (있는 경우)
  if (content) {
    const contentText = content.replace(/<[^>]*>/g, '').replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
    const contentWords = contentText
      .split(/\s+/)
      .filter(word => word.length >= 2 && word.length <= 8)
      .slice(0, 3) // 콘텐츠에서는 최대 3개
    
    contentWords.forEach(word => keywords.add(word))
  }
  
  return Array.from(keywords).slice(0, 10) // 최대 10개 키워드
}

// 🔥 SEO 친화적 메타 설명 생성
export function generateSEODescription(originalDescription: string, title: string, categoryName?: string): string {
  if (!originalDescription || originalDescription.length < 20) {
    // 기본 설명이 없거나 너무 짧은 경우 개선된 설명 생성
    const category = categoryName ? ` ${categoryName}` : ''
    return `${title} | 틈새 시간을 이슈 충전 타임으로!${category} 관련 최신 뉴스와 정보를 픽틈에서 확인하세요.`
  }
  
  // 기존 설명 개선 (끝에 브랜드 문구 추가)
  const cleanDescription = originalDescription.trim()
  if (cleanDescription.length > 140) {
    return cleanDescription.substring(0, 140) + '... | 픽틈'
  }
  
  return cleanDescription + (cleanDescription.endsWith('.') ? '' : '.') + ' | 픽틈'
}

export function generateSocialMeta(data: SocialMetaData) {
  // 이미지 URL 검증 및 절대경로 보장
  let validImageUrl = 'https://www.pickteum.com/pickteum_og.png'
  
  if (data.imageUrl) {
    if (data.imageUrl.startsWith('http')) {
      validImageUrl = data.imageUrl
    } else if (data.imageUrl.startsWith('/')) {
      validImageUrl = `https://www.pickteum.com${data.imageUrl}`
    } else {
      validImageUrl = `https://www.pickteum.com/${data.imageUrl}`
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