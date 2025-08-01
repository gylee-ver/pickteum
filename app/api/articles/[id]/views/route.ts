import { NextRequest, NextResponse } from 'next/server'
import { updateArticleViews } from '@/lib/data'

export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' }, 
        { status: 400 }
      )
    }

    const success = await updateArticleViews(id)
    
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to update views' }, 
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('조회수 업데이트 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}