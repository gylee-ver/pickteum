import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
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
    const headersList = await headers()
    const host = headersList.get('host') || 'www.pickteum.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    return NextResponse.redirect(new URL(`/article/${article.id}`, baseUrl), { status: 301 })
    
  } catch (error) {
    console.error('단축 URL 처리 오류:', error)
    notFound()
  }
} 