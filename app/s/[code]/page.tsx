import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import supabase from '@/lib/supabase'

// 동적 라우트 강제 설정
export const dynamic = 'force-dynamic'

// 메타데이터 생성
export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  try {
    const { code } = params
    console.log('generateMetadata 호출됨, code:', code)
    
    // short_code로 아티클 찾기
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
        slug,
        status,
        category:categories(
          id,
          name,
          color
        )
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('generateMetadata DB 결과:', { article: !!article, error })
    
    if (error || !article) {
      return {
        title: '페이지를 찾을 수 없습니다 | 픽틈',
        description: '요청하신 콘텐츠가 존재하지 않거나 삭제되었을 수 있습니다.',
      }
    }

    const title = article.seo_title || article.title
    const description = article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '')
    const imageUrl = article.thumbnail || '/pickteum_og.png'

    return {
      title: `${title} | 픽틈`,
      description,
      keywords: article.tags?.join(', ') || '',
      authors: [{ name: article.author }],
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author],
        section: article.category?.name || '미분류',
        tags: article.tags || [],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/article/${article.id}`,
      },
    }
  } catch (error) {
    console.error('단축 URL 메타데이터 생성 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 크롤러 감지 함수 (카카오톡 User-Agent 개선)
function isCrawler(userAgent: string): boolean {
  const crawlerRegex = /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|discordbot|slackbot|whatsapp|telegram|kakaotalk|kakao|naver|google|bing|preview/i
  return crawlerRegex.test(userAgent)
}

// 카카오톡 인앱브라우저인지 확인
function isKakaoInApp(userAgent: string): boolean {
  return /kakaotalk/i.test(userAgent)
}

export default async function ShortCodePage({ params }: { params: { code: string } }) {
  try {
    const { code } = params
    console.log('ShortCodePage 호출됨, code:', code)
    
    // 코드 유효성 검사
    if (!code || code.length !== 6) {
      console.log('잘못된 단축 코드 형식:', code)
      notFound()
    }
    
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || ''
    const referer = headersList.get('referer') || ''
    
    console.log('접근 정보:', {
      code,
      userAgent: userAgent.substring(0, 150),
      referer,
      isKakao: isKakaoInApp(userAgent),
      isCrawlerDetected: isCrawler(userAgent)
    })
    
    // short_code로 아티클 찾기
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
        status,
        views,
        short_code,
        category:categories(
          name
        )
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('DB 조회 결과:', {
      found: !!article,
      error: error?.message,
      articleId: article?.id,
      shortCode: article?.short_code
    })
    
    if (error || !article) {
      console.log('단축 URL을 찾을 수 없음:', { code, error })
      
      // 모든 단축 코드 확인 (디버깅용)
      const { data: allCodes } = await supabase
        .from('articles')
        .select('short_code, title')
        .not('short_code', 'is', null)
        .limit(10)
      
      console.log('현재 존재하는 단축 코드들:', allCodes)
      notFound()
    }

    // 조회수 증가 (실제 사용자 접근 시에만)
    if (!isCrawler(userAgent)) {
      console.log('조회수 증가 시도')
      supabase
        .from('articles')
        .update({ views: (article.views || 0) + 1 })
        .eq('id', article.id)
        .then(({ error: updateError }) => {
          if (updateError) {
            console.error('조회수 업데이트 오류:', updateError)
          } else {
            console.log(`아티클 ${article.id} 조회수 증가`)
          }
        })
    }

    // 카카오톡 인앱브라우저는 특별 처리
    if (isKakaoInApp(userAgent)) {
      console.log('카카오톡 인앱브라우저 감지 - 즉시 리다이렉트')
      redirect(`/article/${article.id}`)
    }

    // 일반 크롤러는 메타데이터 페이지 표시
    if (isCrawler(userAgent)) {
      console.log('크롤러 감지 - 메타데이터 페이지 표시')
      
      return (
        <html>
          <head>
            <title>{article.seo_title || article.title} | 픽틈</title>
            <meta name="description" content={article.seo_description || article.content?.replace(/<[^>]*>/g, '').substring(0, 160)} />
            <meta property="og:title" content={article.seo_title || article.title} />
            <meta property="og:description" content={article.seo_description || article.content?.replace(/<[^>]*>/g, '').substring(0, 160)} />
            <meta property="og:image" content={article.thumbnail || '/pickteum_og.png'} />
            <meta property="og:type" content="article" />
            <meta property="og:url" content={`/s/${code}`} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={article.seo_title || article.title} />
            <meta name="twitter:description" content={article.seo_description || article.content?.replace(/<[^>]*>/g, '').substring(0, 160)} />
            <meta name="twitter:image" content={article.thumbnail || '/pickteum_og.png'} />
            <link rel="canonical" href={`/article/${article.id}`} />
            <meta httpEquiv="refresh" content={`3;url=/article/${article.id}`} />
          </head>
          <body>
            <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui' }}>
              <h1>{article.title}</h1>
              <p style={{ color: '#666' }}>{article.category?.name || '미분류'} · {article.author}</p>
              <p style={{ marginTop: '20px' }}>
                <a href={`/article/${article.id}`} style={{ color: '#FFC83D', textDecoration: 'none' }}>
                  전체 글 보기 →
                </a>
              </p>
              <script dangerouslySetInnerHTML={{
                __html: `setTimeout(function(){window.location.href='/article/${article.id}';}, 1000);`
              }} />
            </div>
          </body>
        </html>
      )
    }

    // 일반 사용자는 즉시 리다이렉트
    console.log('일반 사용자 - 즉시 리다이렉트')
    redirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('단축 URL 처리 중 예외 발생:', error)
    notFound()
  }
} 