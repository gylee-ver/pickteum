import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

// 최소한의 테스트 버전
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

// 가장 간단한 테스트 버전
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1>단축 URL 테스트</h1>
      <p>요청된 코드: <strong style={{ color: 'red' }}>{code}</strong></p>
      <p>코드 길이: {code?.length || 0}</p>
      <p>현재 시간: {new Date().toLocaleString()}</p>
      <p style={{ color: 'green' }}>✅ 동적 라우트가 정상 작동합니다!</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', marginRight: '10px' }}>홈으로</a>
        <a href="/test-short" style={{ color: 'blue' }}>테스트 페이지로</a>
      </div>
    </div>
  )
} 