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
    console.log('🔍 메타데이터 생성:', { id, userAgent: process.env.HTTP_USER_AGENT })
    
    // UUID 형식 검증
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let query
    if (isUUID) {
      // UUID인 경우 id로만 검색
      query = supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          summary,
          thumbnail,
          seo_title,
          seo_description,
          author,
          tags,
          slug,
          published_at,
          created_at,
          updated_at,
          category_id,
          category:categories(name)
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single()
    } else {
      // 일반적인 경우 slug 또는 id로 검색
      query = supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          summary,
          thumbnail,
          seo_title,
          seo_description,
          author,
          tags,
          slug,
          published_at,
          created_at,
          updated_at,
          category_id,
          category:categories(name)
        `)
        .or(`slug.eq.${id},id.eq.${id}`)
        .eq('status', 'published')
        .single()
    }

    const { data: article, error } = await query
    
    console.log('📊 조회 결과:', { 
      found: !!article, 
      error: error?.message,
      errorCode: error?.code 
    })

    if (error || !article) {
      console.log('❌ 기본 메타데이터 반환')
      return getDefaultMetadata()
    }

    // SEO에 최적화된 제목 생성
    const seoTitle = article.seo_title || article.title
    const categoryName = (article.category as any)?.name
    const titleWithCategory = categoryName ? `${seoTitle} - ${categoryName}` : seoTitle
    
    // SEO에 최적화된 설명 생성
    let seoDescription = article.seo_description || article.summary
    if (!seoDescription && article.content) {
      // HTML 태그 제거 후 첫 160자 추출
      const plainText = article.content.replace(/<[^>]*>/g, '').trim()
      seoDescription = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }
    seoDescription = seoDescription || '픽틈에서 제공하는 유익한 콘텐츠입니다.'
    
    // 키워드 생성 (제목과 카테고리, 태그 조합)
    const keywords = ['픽틈', 'pickteum', '뉴스', '정보']
    if (categoryName) keywords.push(`${categoryName}뉴스`, categoryName)
    if (article.tags) {
      const tagArray = typeof article.tags === 'string' ? article.tags.split(',') : article.tags
      keywords.push(...(tagArray as string[]).map((tag: string) => tag.trim()))
    }
    
    // 키워드를 250자로 제한
    const keywordsString = keywords.join(', ')
    const limitedKeywords = keywordsString.length > 250 ? 
      keywordsString.substring(0, 247) + '...' : keywordsString
    
    // 썸네일 URL 처리 (검증 로직 제거 - 빠른 응답을 위해)
    let thumbnailUrl = 'https://www.pickteum.com/pickteum_og.png'
    
    if (article.thumbnail && typeof article.thumbnail === 'string' && article.thumbnail.trim() !== '') {
      // URL 형식 확인 및 변환
      if (article.thumbnail.startsWith('http')) {
        thumbnailUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        thumbnailUrl = `https://www.pickteum.com${article.thumbnail}`
      } else {
        thumbnailUrl = `https://www.pickteum.com/${article.thumbnail}`
      }
    }

    // 소셜 메타데이터 생성
    const socialMeta = generateSocialMeta({
      title: titleWithCategory,
      description: seoDescription,
      imageUrl: thumbnailUrl,
      url: `https://www.pickteum.com/article/${id}`,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at,
      author: article.author || '픽틈',
      section: categoryName,
    })

    // 기존 메타데이터 구조 유지하면서 소셜 메타데이터 통합
    const metadata: Metadata = {
      ...socialMeta,
      keywords: limitedKeywords,
      authors: [{ name: article.author || '픽틈' }],
      alternates: {
        canonical: `https://www.pickteum.com/article/${article.slug || id}`,
      },
    }

    console.log('✅ 커스텀 메타데이터 생성 성공')

    return metadata

  } catch (error) {
    console.error('💥 메타데이터 생성 오류:', error)
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
