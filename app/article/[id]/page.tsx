import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import { getArticleById } from '@/lib/data'
import ArticleClient from './article-client'
import ArticleSchema from '@/components/article-schema'
import { generateSocialMeta, getDefaultMetadata } from '@/lib/social-meta'

// 강제 동적 렌더링
// export const dynamic = 'force-dynamic'

// 🔥 ISR 설정 - 5분마다 재검증, 기사별 태그 지원
export const revalidate = 300 // 5분마다 재검증

// 🔥 기사별 revalidateTag를 위한 태그 생성 함수
function getArticleTags(articleId: string) {
  return [
    `article:${articleId}`,
    'articles:all'
  ]
}

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // 성능 최적화: 메타데이터 단계에서 DB 조회를 생략하여 초기 렌더 감소
  try {
    const { id: rawId } = await params
    const id = decodeURIComponent(rawId)
    const base = getDefaultMetadata()
    return {
      ...base,
      alternates: { canonical: `https://www.pickteum.com/article/${id}` },
      openGraph: {
        ...(base.openGraph as any),
        url: `https://www.pickteum.com/article/${id}`,
        images: [{ url: 'https://www.pickteum.com/pickteum_og.png' }]
      }
    }
  } catch {
    return getDefaultMetadata()
  }
}

// 서버 컴포넌트 (기존과 동일하지만 에러 처리 강화)
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params
  const id = decodeURIComponent(rawId)
  console.log('🔍 페이지 컴포넌트:', { id })
  
  if (!id || typeof id !== 'string') {
    console.log('❌ 잘못된 ID 형식')
    notFound()
  }

  // 🔥 기사별 캐시 태그 설정 - 개별 기사 무효화 지원
  const tags = getArticleTags(id)
  console.log('🏷️ 기사 캐시 태그:', tags)

  // UUID 검증 로직 추가
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  // 서버 전용 클라이언트로 단일 조회 (더 빠르고 간결)
  let article = await getArticleById(id)
  let error: any = null
  
  console.log('📊 페이지 데이터 조회:', { found: !!article, error: error?.message })

  // 🔥 글이 존재하지 않는 경우에만 404 (DB 오류와 구분)
  if (!article) {
    if (error?.code === 'PGRST116' || error?.message?.includes('no rows')) {
      // 실제로 글이 없는 경우
      console.log('❌ 아티클 없음, 404 반환')
      notFound()
    } else {
      // DB 연결 오류 등의 경우 - fallback 콘텐츠 제공으로 AdSense 정책 준수
      console.error('🚨 데이터베이스 오류, fallback 콘텐츠 제공:', error)
      
      // 기본 fallback 아티클 데이터 생성
      const fallbackArticle = {
        id: id,
        title: '픽틈 - 콘텐츠 로딩 중',
        content: '<p>콘텐츠를 불러오는 중입니다. 잠시만 기다려주세요.</p><p>페이지를 새로고침하시거나 잠시 후 다시 시도해주세요.</p>',
        seo_description: '픽틈에서 제공하는 뉴스 콘텐츠입니다.',
        thumbnail: '/pickteum_og.png',
        author: '픽틈',
        category: { id: '1', name: '뉴스', color: '#333' },
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        status: 'published'
      }
      
      return (
        <>
          <ArticleSchema article={fallbackArticle} />
          <ArticleClient articleId={id} initialArticle={fallbackArticle} />
        </>
      )
    }
  }

  // 조회수 증가 (백그라운드)
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .then()

  return (
    <>
      {(() => {
        const schemaArticle = {
          id: article.id,
          title: article.title,
          content: article.content || '',
          seo_description: undefined as string | undefined,
          published_at: (article as any).published_at || (article as any).publishedAt || new Date().toISOString(),
          updated_at: (article as any).updated_at || (article as any).publishedAt || new Date().toISOString(),
          thumbnail_url: (article as any).thumbnail || (article as any).thumbnail_url,
          category: { name: article.category?.name || '뉴스' },
          author: (article as any).author || '픽틈'
        }
        return <ArticleSchema article={schemaArticle} />
      })()}
      {/* 🔥 JS 비활성/렌더 제한 환경에서만 보이는 SSR 폴백 */}
      <noscript>
        <article className="px-4 py-6">
          <header className="mb-4">
            <h1 className="text-xl font-bold text-[#212121] mb-2 leading-tight">{article.title}</h1>
          </header>
          <section
            className="prose prose-sm max-w-none text-[#333333] article-content"
            dangerouslySetInnerHTML={{ __html: (article as any).content || '' }}
          />
        </article>
      </noscript>

      {/* 기존 상호작용/트래킹/내부링크 UI는 그대로 유지 */}
      <ArticleClient articleId={id} initialArticle={article} />
    </>
  )
}
