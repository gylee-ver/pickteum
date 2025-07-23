import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'
import ArticleSchema from '@/components/article-schema'
import { generateSocialMeta, getDefaultMetadata } from '@/lib/social-meta'

// 강제 동적 렌더링
// export const dynamic = 'force-dynamic'

// 🔥 수정된 설정 - 안정성 향상
export const revalidate = 300 // 5분마다 재검증 (60초에서 증가)
// 또는 완전히 제거

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  console.log('🔥 SEO 최적화 아티클 메타데이터 v5.1 - slug 지원')
  
  try {
    const { id: rawId } = await params
    const id = decodeURIComponent(rawId)
    console.log('🔥 받은 ID(디코딩):', id)
    
    // UUID 검증
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    console.log('🔥 데이터베이스 조회 시작:', id, isUUID ? '(UUID)' : '(slug)')
    
    // 🔥 타임아웃 증가로 안정성 향상 (3초 → 8초)
    const { data: article, error } = await Promise.race([
      isUUID
        ? supabase
            .from('articles')
            .select('id, title, content, seo_description, thumbnail, author, category:categories(name), published_at, updated_at')
            .eq('id', id)
            .eq('status', 'published')
            .single()
        : supabase
            .from('articles')
            .select('id, title, content, seo_description, thumbnail, author, category:categories(name), published_at, updated_at')
            .eq('slug', id)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(1)
            .then(result => ({ 
              data: result.data?.[0] || null, 
              error: result.error 
            })),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
    ]) as any
    
    console.log('🔥 데이터베이스 결과:', { article: !!article, error: error?.message })
    
    if (error || !article) {
      console.log('🔥 아티클 없음, 기본 메타데이터 반환')
      return getDefaultMetadata()
    }
    
    console.log('🔥 아티클 발견, SEO 최적화 메타데이터 생성 중:', article.title)
    
    // 설명 생성 - seo_description을 먼저 사용하고, 없으면 content에서 추출
    let description = article.seo_description
    if (!description && article.content) {
      // HTML 태그 제거 후 첫 160자 추출
      const plainText = article.content.replace(/<[^>]*>/g, '').trim()
      description = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }
    description = description || '픽틈 아티클'
    
    // 🔥 이미지 URL 절대 경로 보장
    const imageUrl = article.thumbnail 
      ? (article.thumbnail.startsWith('http') 
          ? article.thumbnail 
          : `https://www.pickteum.com${article.thumbnail}`)
      : 'https://www.pickteum.com/pickteum_og.png'
    
    // 🔥 개선된 SEO 메타데이터 생성
    const metadata = {
      ...generateSocialMeta({
        title: article.title.length > 50 ? 
          `${article.title.substring(0, 50)}...` : 
          article.title,
        description,
        imageUrl,
        url: `https://www.pickteum.com/article/${id}`,
        type: 'article',
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
        section: article.category?.name,
        content: article.content, // 🔥 키워드 추출용 콘텐츠 추가
        categoryName: article.category?.name // 🔥 카테고리명 추가
      }),
      // 🔥 추가 SEO 요소
      alternates: {
        canonical: `https://www.pickteum.com/article/${id}`
      },
      // 🔥 키워드는 이제 generateSocialMeta에서 자동 생성됨
      other: {
        'article:published_time': article.published_at,
        'article:modified_time': article.updated_at,
        'article:section': article.category?.name || '뉴스',
        'article:author': article.author || '픽틈'
      }
    }
    
    console.log('🔥 SEO 최적화 메타데이터 생성 완료', {
      title: metadata.title,
      imageUrl: metadata.openGraph?.images?.[0]?.url
    })
    return metadata
    
  } catch (error) {
    console.error('🔥 메타데이터 생성 오류:', error)
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

  // UUID 검증 로직 추가
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  
  let query
  if (isUUID) {
    query = supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('status', 'published')
      .single()
  } else {
    // 🔥 중복 slug 문제 해결: 가장 최근 발행된 글을 우선 선택
    query = supabase
      .from('articles') 
      .select('*, category:categories(*)')
      .eq('slug', id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
  }

  // 🔥 개선된 에러 처리 - 재시도 로직 추가
  let article = null
  let error = null
  
  try {
    const result = await Promise.race([
      query,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 10000))
    ]) as any
    
    // slug로 조회할 때는 배열로 반환되므로 첫 번째 요소 선택
    if (isUUID) {
      article = result.data
    } else {
      article = result.data?.[0] || null
    }
    error = result.error
    
    // 🔥 첫 번째 시도 실패 시 재시도 (네트워크 불안정 대응)
    if (error && !article) {
      console.log('🔄 데이터베이스 재시도 중...', error.message)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
      
      const retryResult = await query
      if (isUUID) {
        article = retryResult.data
      } else {
        article = retryResult.data?.[0] || null
      }
      error = retryResult.error
    }
  } catch (timeoutError) {
    console.error('⏰ 데이터베이스 타임아웃:', timeoutError)
    error = timeoutError
  }
  
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
      <ArticleSchema article={article} />
      <ArticleClient articleId={id} initialArticle={article} />
    </>
  )
}
