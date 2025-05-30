import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'
import ArticleSchema from '@/components/article-schema'
import { RedirectType } from 'next/navigation'
import { generateSocialMeta, getDefaultMetadata } from '@/lib/social-meta'

// 강제 동적 렌더링
// export const dynamic = 'force-dynamic'

// 또는 static으로 변경
export const dynamic = 'force-static'

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  console.log('🚀 generateMetadata 함수 시작')
  
  try {
    const { id } = await params
    console.log('🔍 메타데이터 생성 시작:', { id })
    
    const { data: article, error } = await supabase
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

    console.log('📊 Supabase 조회 결과:', { 
      found: !!article, 
      error: error?.message,
      title: article?.title?.substring(0, 50)
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
  
  if (!id || typeof id !== 'string') {
    notFound()
  }

  // 먼저 slug로 조회 시도
  let article, error
  
  // 숫자로만 이루어진 ID인 경우 (기존 ID 방식)
  const isNumericId = /^\d+$/.test(id)
  
  if (isNumericId) {
    // ID로 조회하여 slug 확인
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('id', id)
      .eq('status', 'published')
      .single()
    
    if (articleError || !articleData) {
      notFound()
    }
    
    // slug가 있으면 slug URL로 리디렉트
    if (articleData.slug && articleData.slug !== id) {
      redirect(`/article/${articleData.slug}`, RedirectType.replace)
    }
    
    article = articleData
    error = articleError
  } else {
    // slug 또는 ID로 조회
    const { data: articleData, error: articleError } = await supabase
      .from('articles')
      .select('*, category:categories(*)')
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq('status', 'published')
      .single()
    
    article = articleData
    error = articleError
  }

  if (error || !article) {
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
