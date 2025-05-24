import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import supabase from '@/lib/supabase'

// 메타데이터 생성
export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  try {
    const { code } = params
    
    // short_code로 아티클 찾기
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
        slug,
        status,
        category:categories(
          id,
          name,
          color
        )
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
    console.error('단축 URL 메타데이터 생성 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 단축 URL 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: { code: string } }) {
  try {
    const { code } = params
    
    // short_code로 아티클 찾기
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, status, views')
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      console.log('단축 URL을 찾을 수 없음:', code, error)
      redirect('/404')
    }

    // 조회수 증가 (백그라운드에서 실행)
    supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)
      .then(() => {
        console.log(`아티클 ${article.id} 조회수 증가 (단축 URL을 통해)`)
      })
      .catch((updateError) => {
        console.error('조회수 업데이트 오류:', updateError)
      })

    // 클라이언트에서 리다이렉트하는 페이지 렌더링
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-8 h-8 border-4 border-[#FFC83D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-xl font-bold mb-2">{article.title}</h1>
          <p className="text-gray-500 mb-4">페이지로 이동 중...</p>
          <p className="text-sm text-gray-400">
            자동으로 이동하지 않으면{' '}
            <a 
              href={`/article/${article.id}`} 
              className="text-[#FFC83D] hover:underline"
            >
              여기를 클릭
            </a>
            하세요
          </p>
        </div>
        
        {/* 클라이언트에서 리다이렉트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function() {
                window.location.href = '/article/${article.id}';
              }, 1000);
            `
          }}
        />
      </div>
    )
    
  } catch (error) {
    console.error('단축 URL 처리 오류:', error)
    redirect('/404')
  }
} 