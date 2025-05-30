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
  const optimizedDescription = data.description?.trim() || '틈새 시간을, 이슈 충전 타임으로!'

  return {
    title: optimizedTitle,
    description: optimizedDescription,
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