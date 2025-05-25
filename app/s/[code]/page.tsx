import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

// 동적 라우트 설정
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 메타데이터 생성 - params await 추가
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  console.log('🔍 generateMetadata 시작, code:', code)
  
  try {
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
        status,
        category:categories(name, color)
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('📊 generateMetadata DB 결과:', { 
      found: !!article, 
      error: error?.message,
      code 
    })
    
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
      keywords: article.tags?.join(', ') || '',
      authors: [{ name: article.author }],
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author],
        section: article.category?.name || '미분류',
        tags: article.tags || [],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/article/${article.id}`,
      },
    }
  } catch (error) {
    console.error('❌ generateMetadata 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 매우 간단한 테스트 버전
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params // await 추가
  console.log('🚀 ShortCodePage 시작, code:', code)
  
  try {
    // 코드 유효성 검사
    if (!code || code.length !== 6) {
      console.log('❌ 잘못된 코드 형식:', code)
      notFound()
    }
    
    // 아티클 조회
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, status, views, short_code')
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('📊 DB 조회 결과:', {
      found: !!article,
      error: error?.message,
      articleId: article?.id,
      shortCode: article?.short_code
    })
    
    if (error || !article) {
      console.log('❌ 아티클을 찾을 수 없음')
      
      // 디버깅: 존재하는 단축 코드들 확인
      const { data: existingCodes } = await supabase
        .from('articles')
        .select('short_code, title')
        .not('short_code', 'is', null)
        .eq('status', 'published')
        .limit(5)
      
      console.log('📋 존재하는 단축 코드들:', existingCodes)
      notFound()
    }

    console.log('✅ 아티클 발견, 리다이렉트 시작:', `/article/${article.id}`)
    
    // 조회수 증가 (백그라운드)
    supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)
      .then(() => console.log('📈 조회수 증가 성공'))
      .catch(err => console.error('📈 조회수 증가 실패:', err))

    // 즉시 리다이렉트
    redirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('💥 ShortCodePage 예외:', error)
    notFound()
  }
} 