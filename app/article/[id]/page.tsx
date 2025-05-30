import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'
import ArticleSchema from '@/components/article-schema'
import { RedirectType } from 'next/navigation'
import { generateSocialMeta, getDefaultMetadata } from '@/lib/social-meta'

// 강제 동적 렌더링
// export const dynamic = 'force-dynamic'

// 수정된 설정
export const revalidate = 60 // 60초마다 재검증
// 또는 완전히 제거

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    
    // UUID 검증 최적화
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    if (!isUUID) {
      return getDefaultMetadata()
    }
    
    // 타임아웃 설정으로 크롤러 응답 최적화
    const { data: article, error } = await Promise.race([
      supabase
        .from('articles')
        .select('id, title, summary, thumbnail, author, category:categories(name)')
        .eq('id', id)
        .eq('status', 'published')
        .single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]) as any
    
    if (error || !article) {
      return getDefaultMetadata()
    }
    
    // 간단한 메타데이터 생성 (빠른 응답)
    return generateSocialMeta({
      title: `${article.title} | 픽틈`,
      description: article.summary || '픽틈 아티클',
      imageUrl: article.thumbnail || 'https://www.pickteum.com/pickteum_og.png',
      url: `https://www.pickteum.com/article/${id}`,
      type: 'article'
    })
    
  } catch (error) {
    console.error('메타데이터 생성 오류:', error)
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
