import { notFound, permanentRedirect } from 'next/navigation'
import { headers } from 'next/headers'
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
    
    // 301 영구 리다이렉트로 원본 URL로 이동
    permanentRedirect(`/article/${article.id}`)
    
  } catch (error) {
    console.error('단축 URL 처리 오류:', error)
    notFound()
  }
} 