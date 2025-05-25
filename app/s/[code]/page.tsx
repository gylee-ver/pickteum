import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

// 최소한의 테스트 버전
export const dynamic = 'force-dynamic'

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  try {
    const { code } = await params
    
    console.log('=== 숏 URL generateMetadata 시작 ===', {
      code,
      codeLength: code?.length,
      codeType: typeof code
    })
    
    // 코드 유효성 검사
    if (!code || typeof code !== 'string' || code.length !== 6) {
      console.log('잘못된 코드 형식:', { code, length: code?.length })
      return getDefaultMetadata()
    }
    
    // 안전한 쿼리
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
        category_id
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('숏 URL DB 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      errorCode: error?.code,
      code,
      articleId: article?.id,
      articleTitle: article?.title?.substring(0, 50)
    })
    
    if (error) {
      console.log('숏 URL DB 오류 상세:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    }
    
    if (!article) {
      // 디버깅: 실제로 존재하는 short_code들 확인
      console.log('아티클을 찾을 수 없음. 기존 short_code들 확인 중...')
      
      try {
        const { data: existingCodes } = await supabase
          .from('articles')
          .select('short_code, title, id')
          .not('short_code', 'is', null)
          .eq('status', 'published')
          .limit(5)
        
        console.log('기존 short_code들:', existingCodes?.map(item => ({
          code: item.short_code,
          title: item.title?.substring(0, 30),
          id: item.id
        })))
      } catch (debugError) {
        console.log('디버깅 쿼리 실패:', debugError)
      }
      
      return getDefaultMetadata()
    }

    // 메타데이터 생성
    const title = (article.seo_title || article.title || '픽틈').trim()
    const description = (article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '') ||
      '픽틈에서 제공하는 유익한 콘텐츠입니다.').trim()
    
    let imageUrl = 'https://pickteum.com/pickteum_og.png'
    if (article.thumbnail && typeof article.thumbnail === 'string') {
      if (article.thumbnail.startsWith('http')) {
        imageUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        imageUrl = `https://pickteum.com${article.thumbnail}`
      } else {
        imageUrl = `https://pickteum.com/${article.thumbnail}`
      }
    }

    console.log('숏 URL 메타데이터 생성 완료:', {
      title: title.substring(0, 50),
      imageUrl,
      articleId: article.id
    })

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
        url: `https://pickteum.com/s/${code}`,
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
        canonical: `https://pickteum.com/article/${article.id}`,
      },
    }

  } catch (error) {
    console.error('숏 URL generateMetadata 치명적 오류:', error)
    return getDefaultMetadata()
  }
}

// 기본 메타데이터 생성 함수
function getDefaultMetadata(): Metadata {
  return {
    title: '픽틈 - 당신의 정크 타임을, 스마일 타임으로!',
    description: '요청하신 콘텐츠를 찾을 수 없습니다.',
    openGraph: {
      title: '픽틈',
      description: '당신의 정크 타임을, 스마일 타임으로!',
      type: 'website',
      images: [
        {
          url: 'https://pickteum.com/pickteum_og.png',
          width: 1200,
          height: 630,
          alt: '픽틈',
        },
      ],
      url: 'https://pickteum.com',
      siteName: '픽틈',
      locale: 'ko_KR',
    },
  }
}

// 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    
    console.log('숏 URL 페이지 접근:', {
      code,
      length: code?.length,
      type: typeof code
    })
    
    // 코드 유효성 검사
    if (!code || typeof code !== 'string' || code.length !== 6) {
      console.log('숏 URL: 잘못된 코드 형식')
      notFound()
    }
    
    // 아티클 조회
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, views, short_code')
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('숏 URL 페이지 DB 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      errorCode: error?.code,
      articleId: article?.id,
      shortCode: article?.short_code
    })
    
    if (error || !article) {
      console.log('숏 URL: 아티클을 찾을 수 없음')
      
      // 디버깅용: 404 페이지에서 정보 표시
      return (
        <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
          <h1>🔍 단축 URL 디버깅</h1>
          <p><strong>요청된 코드:</strong> {code}</p>
          <p><strong>코드 길이:</strong> {code?.length}</p>
          <p><strong>오류:</strong> {error?.message}</p>
          <p><strong>오류 코드:</strong> {error?.code}</p>
          <br />
          <a href="/" style={{ color: 'blue' }}>홈으로 돌아가기</a>
        </div>
      )
    }
    
    console.log('숏 URL: 아티클 발견, 리다이렉트 중:', `/article/${article.id}`)
    
    // 조회수 증가 (에러 무시)
    supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)
      .catch((err) => console.log('조회수 증가 실패 (무시):', err))
    
    // 리다이렉트
    redirect(`/article/${article.id}`)

  } catch (error) {
    console.error('숏 URL 페이지 치명적 오류:', error)
    notFound()
  }
} 