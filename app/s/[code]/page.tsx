import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

// 최소한의 테스트 버전
export const dynamic = 'force-dynamic'

// 캐시를 위한 Map (메모리 기반 임시 캐시)
const articleCache = new Map<string, any>()
const CACHE_TTL = 5 * 60 * 1000 // 5분

// 아티클 데이터 조회 (캐시 포함)
async function getArticleByCode(code: string) {
  const cacheKey = `article_${code}`
  const cached = articleCache.get(cacheKey)
  
  // 캐시된 데이터가 있고 유효한 경우
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data
  }
  
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      content,
      thumbnail,
      seo_title,
      seo_description,
      author,
      tags,
      published_at,
      created_at,
      updated_at,
      short_code,
      category_id,
      views
    `)
    .eq('short_code', code)
    .eq('status', 'published')
    .single()
  
  if (error || !article) {
    return null
  }
  
  // 캐시에 저장
  articleCache.set(cacheKey, {
    data: article,
    timestamp: Date.now()
  })
  
  return article
}

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  try {
    const { code } = await params
    
    // 코드 유효성 검사
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return getDefaultMetadata()
    }
    
    const article = await getArticleByCode(code)
    
    if (!article) {
      return getDefaultMetadata()
    }

    // 메타데이터 생성
    const title = (article.seo_title || article.title || '픽틈').trim()
    const description = (article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '') ||
      '픽틀에서 제공하는 유익한 콘텐츠입니다.').trim()
    
    let imageUrl = 'https://www.pickteum.com/pickteum_og.png'
    if (article.thumbnail && typeof article.thumbnail === 'string') {
      if (article.thumbnail.startsWith('http')) {
        imageUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        imageUrl = `https://www.pickteum.com${article.thumbnail}`
      } else {
        imageUrl = `https://www.pickteum.com/${article.thumbnail}`
      }
    }

    return {
      title: `${title} | 픽틈`,
      description,
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      authors: [{ name: article.author || '픽틈' }],
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author || '픽틈'],
        section: '픽틈',
        tags: Array.isArray(article.tags) ? article.tags : [],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        url: `https://www.pickteum.com/s/${code}`,
        siteName: '픽틈',
        locale: 'ko_KR',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
        creator: '@pickteum',
        site: '@pickteum',
      },
      alternates: {
        canonical: `https://www.pickteum.com/article/${article.id}`,
      },
    }

  } catch (error) {
    console.error('메타데이터 생성 오류:', error)
    return getDefaultMetadata()
  }
}

// 기본 메타데이터 생성 함수
function getDefaultMetadata(): Metadata {
  return {
    title: '틈 날 땐? 픽틈!',
    description: '요청하신 콘텐츠를 찾을 수 없습니다.',
    openGraph: {
      title: '틈 날 땐? 픽틈!',
      description: '틈새 시간을, 이슈 충전 타임으로!',
      type: 'website',
      images: [
        {
          url: 'https://www.pickteum.com/pickteum_og.png',
          width: 1200,
          height: 630,
          alt: '틈 날 땐? 픽틈!',
        },
      ],
      url: 'https://www.pickteum.com',
      siteName: '픽틈',
      locale: 'ko_KR',
    },
  }
}

// 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  if (!code || typeof code !== 'string' || code.length !== 6) {
    notFound()
  }
  
  // 캐시된 데이터 재사용
  const article = await getArticleByCode(code)
  
  if (!article) {
    notFound()
  }
  
  // 조회수 증가 (비동기, 백그라운드)
  // redirect 전에 실행하되 기다리지 않음
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .catch(error => {
      console.log('조회수 증가 실패:', error.message)
    })
  
  // 즉시 redirect
  redirect(`/article/${article.id}`)
} 