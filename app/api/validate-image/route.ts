// 이미지 접근성 검증 API
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ valid: false, error: 'URL required' }, { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      },
      signal: AbortSignal.timeout(5000)
    })
    
    const contentType = response.headers.get('content-type')
    const isImage = contentType?.startsWith('image/') || false
    
    return NextResponse.json({ 
      valid: response.ok && isImage,
      status: response.status,
      contentType,
      size: response.headers.get('content-length'),
      isAccessible: response.ok,
      isImage
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      valid: false, 
      error: errorMessage,
      isAccessible: false,
      isImage: false
    })
  }
} 