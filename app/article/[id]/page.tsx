import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'
import ArticleSchema from '@/components/article-schema'
import { RedirectType } from 'next/navigation'
import { generateSocialMeta, getDefaultMetadata } from '@/lib/social-meta'

// 강제 동적 렌더링
// export const dynamic = 'force-dynamic'

// 🔥 수정된 설정 - 안정성 향상
export const revalidate = 300 // 5분마다 재검증 (60초에서 증가)
// 또는 완전히 제거

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  console.log('🔥 SEO 최적화 아티클 메타데이터 v4.0')
  
  try {
    const { id } = await params
    console.log('🔥 받은 ID:', id)
    
    // UUID 검증 최적화
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUUID) {
      console.log('🔥 UUID 검증 실패, 기본 메타데이터 반환')
      return getDefaultMetadata()
    }
    
    console.log('🔥 데이터베이스 조회 시작:', id)
    
    // 🔥 타임아웃 증가로 안정성 향상 (3초 → 8초)
    const { data: article, error } = await Promise.race([
      supabase
        .from('articles')
        .select('id, title, content, seo_description, thumbnail, author, category:categories(name), published_at, updated_at')
        .eq('id', id)
        .eq('status', 'published')
        .single(),
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
    
    // 🔥 개선된 SEO 메타데이터 생성
    const metadata = {
      ...generateSocialMeta({
        title: article.title.length > 50 ? 
          `${article.title.substring(0, 50)}...` : 
          article.title,
        description,
        imageUrl: article.thumbnail || 'https://www.pickteum.com/pickteum_og.png',
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
    
    console.log('🔥 SEO 최적화 메타데이터 생성 완료')
    return metadata
    
  } catch (error) {
    console.error('🔥 메타데이터 생성 오류:', error)
    return getDefaultMetadata()
  }
}

// 서버 컴포넌트 (기존과 동일하지만 에러 처리 강화)
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    query = supabase
      .from('articles') 
      .select('*, category:categories(*)')
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq('status', 'published')
      .single()
  }

  const { data: article, error } = await query
  
  console.log('📊 페이지 데이터 조회:', { found: !!article, error: error?.message })

  if (error || !article) {
    console.log('❌ 아티클 없음, 404 반환')
    notFound()
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
