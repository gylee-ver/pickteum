import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'

// 강제 동적 렌더링
export const dynamic = 'force-dynamic'

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    
    // 가장 안전한 쿼리 (조인 없이)
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
        slug,
        published_at,
        created_at,
        updated_at,
        category_id
      `)
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      // 에러시에도 기본 메타데이터 반환
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

    // 카테고리 정보 별도 조회 (실패해도 계속 진행)
    let categoryName = '미분류'
    try {
      if (article.category_id) {
        const { data: category } = await supabase
          .from('categories')
          .select('name')
          .eq('id', article.category_id)
          .single()
        
        if (category) {
          categoryName = category.name
        }
      }
    } catch (catError) {
      // 카테고리 조회 실패는 무시
    }

    // 안전한 메타데이터 구성
    const title = (article.seo_title || article.title || '픽틈').trim()
    const description = (article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '') ||
      '픽틈에서 제공하는 유익한 콘텐츠입니다.').trim()
    
    // 안전한 이미지 URL 처리
    let imageUrl = 'https://www.pickteum.com/pickteum_og.png'
    try {
      if (article.thumbnail && typeof article.thumbnail === 'string') {
        if (article.thumbnail.startsWith('http')) {
          imageUrl = article.thumbnail
        } else if (article.thumbnail.startsWith('/')) {
          imageUrl = `https://www.pickteum.com${article.thumbnail}`
        } else {
          imageUrl = `https://www.pickteum.com/${article.thumbnail}`
        }
      }
    } catch (imgError) {
      // 이미지 URL 처리 오류 시 기본값 사용
    }

    const metadata: Metadata = {
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
        section: categoryName,
        tags: Array.isArray(article.tags) ? article.tags : [],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        url: `https://www.pickteum.com/article/${id}`,
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
  try {
    const { id } = await params
    
    // 안전한 아티클 데이터 로딩
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
        slug,
        published_at,
        created_at,
        updated_at,
        views,
        category_id,
        category:categories(id, name, color)
      `)
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      notFound()
    }

    return (
      <ArticleClient 
        articleId={article.id} 
        initialArticle={article} 
      />
    )

  } catch (error) {
    notFound()
  }
}
