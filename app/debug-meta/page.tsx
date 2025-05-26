import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '메타데이터 테스트 | 픽틈',
  description: '이것은 OG 메타데이터 테스트 페이지입니다.',
  openGraph: {
    title: '메타데이터 테스트',
    description: '이것은 OG 메타데이터 테스트 페이지입니다.',
    type: 'article',
    images: [
      {
        url: 'https://www.pickteum.com/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '픽틈 로고',
      },
    ],
    url: 'https://www.pickteum.com/debug-meta',
    siteName: '픽틈',
  },
  twitter: {
    card: 'summary_large_image',
    title: '메타데이터 테스트',
    description: '이것은 OG 메타데이터 테스트 페이지입니다.',
    images: ['https://www.pickteum.com/pickteum_og.png'],
  },
}

export default function DebugMetaPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1>🔍 메타데이터 테스트 페이지</h1>
      <p>이 페이지는 OG 메타데이터 테스트용입니다.</p>
      <p>페이지 소스를 확인하여 다음 메타 태그들이 있는지 확인하세요:</p>
      <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
        <li>&lt;meta property="og:title" content="메타데이터 테스트"&gt;</li>
        <li>&lt;meta property="og:description" content="..."&gt;</li>
        <li>&lt;meta property="og:image" content="https://www.pickteum.com/pickteum_og.png"&gt;</li>
        <li>&lt;meta property="og:url" content="https://www.pickteum.com/debug-meta"&gt;</li>
      </ul>
      <br />
      <a href="/" style={{ color: 'blue' }}>홈으로 돌아가기</a>
    </div>
  )
} 