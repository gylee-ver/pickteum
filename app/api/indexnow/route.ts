import { NextRequest, NextResponse } from 'next/server'

// IndexNow API 키 (환경변수에서 가져오거나 고정값 사용)
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'

export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json()
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs are required' }, { status: 400 })
    }

    // IndexNow API 호출
    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'www.pickteum.com',
        key: INDEXNOW_KEY,
        keyLocation: `https://www.pickteum.com/${INDEXNOW_KEY}.txt`,
        urlList: urls
      })
    })

    if (indexNowResponse.ok) {
      console.log('IndexNow 성공:', urls)
      return NextResponse.json({ 
        success: true, 
        message: `${urls.length}개 URL이 IndexNow에 제출되었습니다.`,
        urls 
      })
    } else {
      console.error('IndexNow 실패:', indexNowResponse.status, indexNowResponse.statusText)
      return NextResponse.json({ 
        error: 'IndexNow API 호출 실패',
        status: indexNowResponse.status 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('IndexNow API 오류:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// IndexNow 키 파일 제공
export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
} 