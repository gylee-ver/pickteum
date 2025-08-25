import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { supabaseServer, hasServiceRoleKey } from '@/lib/data'

// 서버 전용: 아티클 생성
export async function POST(request: NextRequest) {
  try {
    if (!hasServiceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않아 발행을 처리할 수 없습니다.' },
        { status: 500 }
      )
    }
    const body = await request.json()
    const now = new Date().toISOString()

    const articleData = {
      title: body.title?.trim(),
      content: body.content?.trim(),
      category_id: body.category_id,
      author: body.author || '픽틈 스포츠이슈팀',
      slug: body.slug,
      status: body.status || 'draft',
      thumbnail: body.thumbnail || null,
      thumbnail_alt: body.thumbnail_alt || null,
      seo_title: body.seo_title || body.title,
      seo_description: body.seo_description || '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      published_at: body.published_at || (body.status === 'published' ? now : null),
      created_at: body.created_at || now,
      updated_at: body.updated_at || now,
      views: typeof body.views === 'number' ? body.views : 0
    }

    // 카테고리 이름으로 ID 자동 매핑 (category_id가 없고 category_name이 있을 때)
    if (!articleData.category_id && body.category_name) {
      const { data: cat, error: catErr } = await supabaseServer
        .from('categories')
        .select('id')
        .eq('name', String(body.category_name))
        .limit(1)
        .single()
      if (catErr) {
        return NextResponse.json({ error: `카테고리 확인 실패: ${catErr.message}` }, { status: 400 })
      }
      if (cat?.id) {
        ;(articleData as any).category_id = cat.id
      }
    }

    // 필수 필드 검증
    if (!articleData.title || !articleData.content || !articleData.category_id || !articleData.slug) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 })
    }

    // 중복 slug 방지 (서버 측 방어)
    const { data: existing, error: existingError } = await supabaseServer
      .from('articles')
      .select('id')
      .eq('slug', articleData.slug)
      .limit(1)

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: '동일한 슬러그가 이미 존재합니다.' }, { status: 409 })
    }

    const { data, error } = await supabaseServer
      .from('articles')
      .insert([articleData])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 캐시 무효화
    try {
      if (data?.id) {
        revalidateTag('articles:all')
        revalidateTag(`article:${data.id}`)
      }
      revalidatePath('/')
    } catch {}

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '서버 오류' }, { status: 500 })
  }
}

// 서버 전용: 아티클 업데이트
export async function PUT(request: NextRequest) {
  try {
    if (!hasServiceRoleKey) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY가 설정되지 않아 수정/발행을 처리할 수 없습니다.' },
        { status: 500 }
      )
    }
    const body = await request.json()
    const { id, data: payload } = body || {}
    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const updateData = {
      title: payload?.title?.trim(),
      content: payload?.content?.trim(),
      category_id: payload?.category_id,
      author: payload?.author || '픽틈 스포츠이슈팀',
      slug: payload?.slug,
      status: payload?.status || 'draft',
      thumbnail: payload?.thumbnail ?? null,
      thumbnail_alt: payload?.thumbnail_alt ?? null,
      seo_title: payload?.seo_title || payload?.title,
      seo_description: payload?.seo_description || '',
      tags: Array.isArray(payload?.tags) ? payload.tags : [],
      published_at: payload?.published_at ?? null,
      updated_at: now
    }

    // 카테고리 이름으로 ID 자동 매핑 (category_id가 없고 category_name이 있을 때)
    if (!updateData.category_id && payload?.category_name) {
      const { data: cat, error: catErr } = await supabaseServer
        .from('categories')
        .select('id')
        .eq('name', String(payload.category_name))
        .limit(1)
        .single()
      if (catErr) {
        return NextResponse.json({ error: `카테고리 확인 실패: ${catErr.message}` }, { status: 400 })
      }
      if (cat?.id) {
        ;(updateData as any).category_id = cat.id
      }
    }

    if (!updateData.title || !updateData.content || !updateData.category_id || !updateData.slug) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 캐시 무효화
    try {
      if (data?.id) {
        revalidateTag('articles:all')
        revalidateTag(`article:${data.id}`)
      }
      revalidatePath('/')
    } catch {}

    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '서버 오류' }, { status: 500 })
  }
}


