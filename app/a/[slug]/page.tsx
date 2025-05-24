import { redirect } from 'next/navigation'
import supabase from '@/lib/supabase'

export default async function ShortUrlPage({ params }: { params: { slug: string } }) {
  try {
    // slug로 article 찾기
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, slug')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      redirect('/404')
    }
    
    // 원본 URL로 리다이렉트
    redirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('단축 URL 처리 오류:', error)
    redirect('/404')
  }
} 