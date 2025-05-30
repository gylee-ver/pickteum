import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'
import ArticleSchema from '@/components/article-schema'
import { RedirectType } from 'next/navigation'

// 강제 동적 렌더링
export const dynamic = 'force-dynamic'

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    
    // 카테고리 정보도 함께 가져오기
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

    if (error || !article) {
      return {
        title: '픽틈 - 틈새시간을 이슈충전 타임으로',
        description: '요청하신 콘텐츠를 찾을 수 없습니다.',
        openGraph: {
          title: '픽틈 - 틈새시간을 이슈충전 타임으로',
          description: '틈새 시간을, 이슈 충전 타임으로!',
          type: 'website',
          images: [
            {
              url: 'https://www.pickteum.com/pickteum_og.png',
              width: 1200,
              height: 630,
            }
          ]
        }
      }
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
    
    // 썸네일 URL 처리 (절대경로 보장)
    let thumbnailUrl = 'https://www.pickteum.com/pickteum_og.png'
    if (article.thumbnail) {
      if (article.thumbnail.startsWith('http')) {
        thumbnailUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        thumbnailUrl = `https://www.pickteum.com${article.thumbnail}`
      } else {
        thumbnailUrl = `https://www.pickteum.com/${article.thumbnail}`
      }
    }

    const metadata: Metadata = {
      title: titleWithCategory,
      description: seoDescription,
      keywords: limitedKeywords,
      authors: [{ name: article.author || '픽틈' }],
      openGraph: {
        title: titleWithCategory,
        description: seoDescription,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author || '픽틈'],
        section: categoryName,
        tags: Array.isArray(article.tags) ? article.tags : [],
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: titleWithCategory,
          },
        ],
        url: `https://www.pickteum.com/article/${id}`,
        siteName: '픽틈',
        locale: 'ko_KR',
      },
      twitter: {
        card: 'summary_large_image',
        title: titleWithCategory,
        description: seoDescription,
        images: [thumbnailUrl],
        creator: '@pickteum',
        site: '@pickteum',
      },
      alternates: {
        canonical: `https://www.pickteum.com/article/${article.slug || id}`,
      },
    }

    return metadata

  } catch (error) {
    // 치명적 오류시에도 기본 메타데이터 반환 (절대 실패하지 않음)
    return {
      title: '틈 날 땐? 픽틈!',
      description: '틈새 시간을, 이슈 충전 타임으로!',
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
