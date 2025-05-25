import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

// 동적 라우트 강제 설정
export const dynamic = 'force-dynamic'

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  try {
    const { code } = await params
    
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
        category:categories(name, color)
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
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
      openGraph: {
        title,
        description,
        type: 'article',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    }
  } catch (error) {
    return {
      title: '오류 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 메인 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    
    // 기본 유효성 검사
    if (!code) {
      notFound()
    }
    
    // 아티클 조회
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, status, views')
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      notFound()
    }

    // 조회수 증가 (백그라운드)
    supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)
      .then(() => console.log('조회수 증가'))
      .catch(() => console.log('조회수 증가 실패'))

    // 즉시 리다이렉트
    redirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('단축 URL 오류:', error)
    notFound()
  }
} 