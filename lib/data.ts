import { createClient } from '@supabase/supabase-js'
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getImageUrl } from "@/lib/utils"

// 서버 전용 Supabase 클라이언트 (Service Role 키 사용 우선)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const hasServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

// 환경 변수 확인 로깅
if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다')
}
if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY와 NEXT_PUBLIC_SUPABASE_ANON_KEY가 모두 설정되지 않았습니다')
}
console.log('Supabase 설정:', {
  url: supabaseUrl ? '설정됨' : '미설정',
  key: supabaseServiceKey ? '설정됨' : '미설정',
  keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon Key'
})

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
  created_at?: string
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
  // UUID vs slug 구분: slug 중복 시 최신 발행글을 선택해야 함
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let article: any = null
  let error: any = null

  if (isUUID) {
    const { data, error: err } = await supabaseServer
      .from('articles')
      .select(`
        id,
        title,
        content,
        thumbnail,
        published_at,
        created_at,
        updated_at,
        slug,
        category_id,
        views,
        author,
        categories(name, color)
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single()
    article = data
    error = err
  } else {
    // slug 중복 안전: 최신 발행 순으로 1개만 선택
    const { data, error: err } = await supabaseServer
      .from('articles')
      .select(`
        id,
        title,
        content,
        thumbnail,
        published_at,
        created_at,
        updated_at,
        slug,
        category_id,
        views,
        author,
        categories(name, color)
      `)
      .eq('slug', id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(1)
    article = data?.[0] || null
    error = err
  }

  if (error) {
    console.error('getArticleById 오류:', error)
    return null
  }

  if (!article) return null

  return {
    id: article.id, // UUID 유지 (클라이언트 액션용)
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
    slug: article.slug, // 링크용
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
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getCategories 오류:', error)
    // 데이터베이스 오류 시 기본 카테고리 반환
    return [
      { id: '1', name: '건강', color: '#4CAF50' },
      { id: '2', name: '스포츠', color: '#2196F3' },
      { id: '3', name: '정치/시사', color: '#9C27B0' },
      { id: '4', name: '경제', color: '#FF9800' },
      { id: '5', name: '라이프', color: '#FF5722' },
      { id: '6', name: '테크', color: '#607D8B' }
    ]
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
    console.log('updateArticleViews 시작, articleId:', articleId)
    
    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(articleId)) {
      console.error('잘못된 UUID 형식:', articleId)
      return false
    }
    
    // 방법 1: RPC 함수를 사용한 안전한 조회수 업데이트 (권장)
    try {
      const { data: rpcResult, error: rpcError } = await supabaseServer
        .rpc('increment_article_views', { article_id: articleId })

      if (!rpcError && rpcResult !== null) {
        console.log('✅ RPC를 통한 조회수 업데이트 성공:', rpcResult)
        return true
      } else if (rpcError) {
        console.warn('RPC 조회수 업데이트 실패, 대안 방법 시도:', rpcError.message)
      }
    } catch (rpcError) {
      console.warn('RPC 함수 미지원, 일반 업데이트 시도:', rpcError)
    }
    
    // 방법 2: 일반 UPDATE 쿼리 (RPC 실패 시 대안)
    console.log('일반 UPDATE 방식으로 조회수 업데이트 시도')
    
    // 먼저 아티클이 존재하고 published 상태인지 확인
    const { data: article, error: checkError } = await supabaseServer
      .from('articles')
      .select('id, views, status, title')
      .eq('id', articleId)
      .eq('status', 'published')
      .single()

    console.log('아티클 존재 확인:', { 
      found: !!article, 
      status: article?.status,
      currentViews: article?.views,
      title: article?.title?.substring(0, 50),
      error: checkError?.message 
    })

    if (checkError) {
      console.error('아티클 조회 중 오류:', {
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
        code: checkError.code
      })
      return false
    }

    if (!article) {
      console.log('발행된 아티클을 찾을 수 없음')
      return false
    }

    // 조회수 업데이트 시도
    const newViews = (article.views || 0) + 1
    console.log('조회수 업데이트 시도:', { 
      currentViews: article.views || 0, 
      newViews 
    })
    
    const { data: updateResult, error: updateError } = await supabaseServer
      .from('articles')
      .update({ views: newViews })
      .eq('id', articleId)
      .eq('status', 'published') // 추가 안전장치
      .select('views')

    if (updateError) {
      console.error('조회수 업데이트 오류:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      })
      
      // 방법 3: 최후의 수단 - RLS 우회를 위한 간단한 시도
      try {
        console.log('RLS 우회 시도 - views 컬럼만 업데이트')
        const { error: simpleError } = await supabaseServer
          .from('articles')
          .update({ views: newViews })
          .eq('id', articleId)
          // status 조건 제거하여 RLS 정책 우회 시도
          
        if (!simpleError) {
          console.log('✅ 간단한 업데이트를 통한 조회수 업데이트 성공')
          return true
        } else {
          console.error('간단한 업데이트도 실패:', simpleError)
        }
      } catch (simpleError) {
        console.error('간단한 업데이트 예외:', simpleError)
      }
      
      return false
    }
    
    console.log('✅ 일반 UPDATE를 통한 조회수 업데이트 성공:', {
      newViews,
      updateResult
    })
    return true
    
  } catch (error) {
    console.error('updateArticleViews 예외:', error)
    console.error('예외 스택:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

// 서버 Supabase 클라이언트를 외부에서 사용해야 할 경우를 위한 export
export { supabaseServer }