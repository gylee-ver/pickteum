import { notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

export default async function ShortUrlPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    
    // slug로 article 찾기
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, slug')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      notFound()
    }
    
    // 원본 URL로 리다이렉트
    const { redirect } = await import('next/navigation')
    redirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('단축 URL 처리 오류:', error)
    notFound()
  }
} 