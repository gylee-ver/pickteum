import { createClient } from '@supabase/supabase-js'
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getImageUrl } from "@/lib/utils"

// 서버 전용 Supabase 클라이언트 (Service Role 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'pickteum-server',
    },
  }
})

// 인터페이스 정의
export interface Article {
  id: string
  title: string
  category: {
    name: string
    color: string
  }
  thumbnail: string
  date: string
  publishedAt: string
  views?: number
  content?: string
  slug?: string
  category_id?: string
}

export interface Category {
  id: string
  name: string
  color: string
  order_index?: number
}

/**
 * 서버 전용: 아티클 목록을 페이지네이션으로 가져오기
 */
export async function getArticles(params: {
  page?: number
  limit?: number
  category?: string
  includeDrafts?: boolean
}): Promise<{ articles: Article[], hasMore: boolean, total: number }> {
  const { page = 1, limit = 5, category = '전체', includeDrafts = false } = params
  
  const from = (page - 1) * limit
  const to = page * limit - 1

  let query = supabaseServer
    .from('articles')
    .select(`
      id,
      title,
      thumbnail,
      published_at,
      created_at,
      slug,
      category_id,
      views,
      categories!inner(name, color)
    `, { count: 'exact' })
    
  if (!includeDrafts) {
    query = query.eq('status', 'published')
  }
  
  query = query
    .order('published_at', { ascending: false })
    .range(from, to)

  // 카테고리 필터링
  if (category !== '전체') {
    const { data: categoryData } = await supabaseServer
      .from('categories')
      .select('id')
      .eq('name', category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  const { data: articles, error, count } = await query

  if (error) {
    console.error('getArticles 오류:', error)
    return { articles: [], hasMore: false, total: 0 }
  }

  const formattedArticles: Article[] = articles?.map(article => ({
    id: article.slug || article.id,
    title: article.title,
    category: {
      name: (article as any).categories?.name || '미분류',
      color: (article as any).categories?.color || '#cccccc'
    },
    thumbnail: getImageUrl(article.thumbnail),
    date: article.published_at ? 
      format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
      format(new Date(), 'yyyy.MM.dd', { locale: ko }),
    publishedAt: article.published_at,
    views: article.views || 0,
    slug: article.slug,
    category_id: article.category_id
  })) || []

  return {
    articles: formattedArticles,
    hasMore: formattedArticles.length === limit,
    total: count || 0
  }
}

/**
 * 서버 전용: 단일 아티클 가져오기
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const { data: article, error } = await supabaseServer
    .from('articles')
    .select(`
      id,
      title,
      content,
      thumbnail,
      published_at,
      created_at,
      slug,
      category_id,
      views,
      meta_title,
      meta_description,
      categories(name, color)
    `)
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error('getArticleById 오류:', error)
    return null
  }

  if (!article) return null

  return {
    id: article.slug || article.id,
    title: article.title,
    content: article.content,
    category: {
      name: (article as any).categories?.name || '미분류',
      color: (article as any).categories?.color || '#cccccc'
    },
    thumbnail: getImageUrl(article.thumbnail),
    date: article.published_at ? 
      format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
      format(new Date(), 'yyyy.MM.dd', { locale: ko }),
    publishedAt: article.published_at,
    views: article.views || 0,
    slug: article.slug,
    category_id: article.category_id
  }
}

/**
 * 서버 전용: 모든 카테고리 가져오기
 */
export async function getCategories(): Promise<Category[]> {
  const { data: categories, error } = await supabaseServer
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) {
    console.error('getCategories 오류:', error)
    return []
  }

  return categories || []
}

/**
 * 서버 전용: 아티클 검색
 */
export async function searchArticles(query: string, limit: number = 5): Promise<Article[]> {
  if (!query.trim()) return []

  const { data: articles, error } = await supabaseServer
    .from('articles')
    .select(`
      id,
      title,
      slug,
      thumbnail,
      categories(name, color)
    `)
    .eq('status', 'published')
    .ilike('title', `%${query}%`)
    .limit(limit)

  if (error) {
    console.error('searchArticles 오류:', error)
    return []
  }

  return articles?.map(article => {
    const categoryData = Array.isArray(article.categories) 
      ? article.categories[0] 
      : article.categories

    return {
      id: article.slug || article.id,
      title: article.title,
      category: categoryData || { name: '미분류', color: '#cccccc' },
      thumbnail: getImageUrl(article.thumbnail),
      date: '',
      publishedAt: '',
      slug: article.slug
    }
  }) || []
}

/**
 * 서버 전용: 관련 아티클 가져오기
 */
export async function getRelatedArticles(categoryId: string, currentArticleId: string, limit: number = 5): Promise<Article[]> {
  const { data: articles, error } = await supabaseServer
    .from('articles')
    .select(`
      id,
      title,
      thumbnail,
      published_at,
      slug,
      categories(name, color)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', currentArticleId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getRelatedArticles 오류:', error)
    return []
  }

  return articles?.map(article => ({
    id: article.slug || article.id,
    title: article.title,
    category: {
      name: (article as any).categories?.name || '미분류',
      color: (article as any).categories?.color || '#cccccc'
    },
    thumbnail: getImageUrl(article.thumbnail),
    date: article.published_at ? 
      format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
      format(new Date(), 'yyyy.MM.dd', { locale: ko }),
    publishedAt: article.published_at,
    slug: article.slug
  })) || []
}

/**
 * 서버 전용: 인기 아티클 가져오기
 */
export async function getPopularArticles(limit: number = 5): Promise<Article[]> {
  const { data: articles, error } = await supabaseServer
    .from('articles')
    .select(`
      id,
      title,
      thumbnail,
      published_at,
      views,
      slug,
      categories(name, color)
    `)
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getPopularArticles 오류:', error)
    return []
  }

  return articles?.map(article => ({
    id: article.slug || article.id,
    title: article.title,
    category: {
      name: (article as any).categories?.name || '미분류',
      color: (article as any).categories?.color || '#cccccc'
    },
    thumbnail: getImageUrl(article.thumbnail),
    date: article.published_at ? 
      format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
      format(new Date(), 'yyyy.MM.dd', { locale: ko }),
    publishedAt: article.published_at,
    views: article.views || 0,
    slug: article.slug
  })) || []
}

/**
 * 서버 전용: 조회수 업데이트
 */
export async function updateArticleViews(articleId: string): Promise<boolean> {
  try {
    // 현재 조회수 가져오기
    const { data: currentArticle } = await supabaseServer
      .from('articles')
      .select('views')
      .eq('id', articleId)
      .single()

    if (currentArticle) {
      // 조회수 +1 업데이트
      const { error } = await supabaseServer
        .from('articles')
        .update({ views: (currentArticle.views || 0) + 1 })
        .eq('id', articleId)

      if (error) {
        console.error('updateArticleViews 오류:', error)
        return false
      }
      return true
    }
    return false
  } catch (error) {
    console.error('updateArticleViews 예외:', error)
    return false
  }
}

// 서버 Supabase 클라이언트를 외부에서 사용해야 할 경우를 위한 export
export { supabaseServer }