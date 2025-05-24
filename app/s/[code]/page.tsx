import { redirect } from 'next/navigation'
import supabase from '@/lib/supabase'

export default async function ShortCodePage({ params }: { params: { code: string } }) {
  try {
    const { code } = params
    
    // short_code로 아티클 찾기
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, slug, status, views')
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
    
    // 원본 아티클 페이지로 리다이렉트
    redirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('단축 URL 처리 오류:', error)
    redirect('/404')
  }
} 