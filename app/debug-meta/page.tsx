import { Metadata } from 'next'
import { canonical } from '@/lib/metadata'

export const metadata: Metadata = {
  title: '메타데이터 테스트',
  description: '틈새 시간을, 이슈 충전 타임으로! 이것은 OG 메타데이터 테스트 페이지입니다.',
  ...canonical('/debug-meta'),
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: '메타데이터 테스트',
    description: '틈새 시간을, 이슈 충전 타임으로! 이것은 OG 메타데이터 테스트 페이지입니다.',
    type: 'article',
    images: [
      {
        url: 'https://www.pickteum.com/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '틈 날 땐? 픽틈!',
      },
    ],
    url: 'https://www.pickteum.com/debug-meta',
    siteName: '픽틈',
  },
  twitter: {
    card: 'summary_large_image',
    title: '메타데이터 테스트',
    description: '틈새 시간을, 이슈 충전 타임으로! 이것은 OG 메타데이터 테스트 페이지입니다.',
    images: ['https://www.pickteum.com/pickteum_og.png'],
  },
}

export default function DebugMetaPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🔍 메타데이터 & 소셜 미디어 디버거</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>📋 현재 페이지 메타데이터</h2>
        <p>이 페이지는 OG 메타데이터 테스트용입니다.</p>
        <p>페이지 소스를 확인하여 다음 메타 태그들이 있는지 확인하세요:</p>
        <ul style={{ textAlign: 'left', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
          <li><code>&lt;meta property="og:title" content="메타데이터 테스트"&gt;</code></li>
          <li><code>&lt;meta property="og:description" content="..."&gt;</code></li>
          <li><code>&lt;meta property="og:image" content="https://www.pickteum.com/pickteum_og.png"&gt;</code></li>
          <li><code>&lt;meta property="og:url" content="https://www.pickteum.com/debug-meta"&gt;</code></li>
          <li><code>&lt;meta name="twitter:card" content="summary_large_image"&gt;</code></li>
        </ul>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🔗 소셜 미디어 테스트 링크</h2>
        <p>다음 도구들을 사용하여 소셜 미디어 공유 미리보기를 확인할 수 있습니다:</p>
        <ul style={{ lineHeight: '2' }}>
          <li>
            <strong>Facebook Sharing Debugger:</strong>{' '}
            <a 
              href="https://developers.facebook.com/tools/debug/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#1877f2' }}
            >
              https://developers.facebook.com/tools/debug/
            </a>
          </li>
          <li>
            <strong>Twitter Card Validator:</strong>{' '}
            <a 
              href="https://cards-dev.twitter.com/validator" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#1da1f2' }}
            >
              https://cards-dev.twitter.com/validator
            </a>
          </li>
          <li>
            <strong>LinkedIn Post Inspector:</strong>{' '}
            <a 
              href="https://www.linkedin.com/post-inspector/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#0077b5' }}
            >
              https://www.linkedin.com/post-inspector/
            </a>
          </li>
          <li>
            <strong>Open Graph Tester:</strong>{' '}
            <a 
              href="https://www.opengraph.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#333' }}
            >
              https://www.opengraph.xyz/
            </a>
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>🧪 테스트할 URL 예시</h2>
        <div style={{ backgroundColor: '#f0f8ff', padding: '15px', borderRadius: '5px' }}>
          <p><strong>홈페이지:</strong> https://www.pickteum.com</p>
          <p><strong>아티클 예시:</strong> https://www.pickteum.com/article/[아티클ID]</p>
          <p><strong>카테고리 예시:</strong> https://www.pickteum.com/category/스포츠</p>
          <p><strong>현재 페이지:</strong> https://www.pickteum.com/debug-meta</p>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>⚠️ 캐시 주의사항</h2>
        <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px', border: '1px solid #ffeaa7' }}>
          <p><strong>소셜 미디어 플랫폼들은 메타데이터를 캐시합니다!</strong></p>
          <ul>
            <li>메타데이터 변경 후 즉시 반영되지 않을 수 있습니다.</li>
            <li>위의 디버깅 도구들을 사용하여 캐시를 강제로 갱신할 수 있습니다.</li>
            <li>이미지 URL이 변경된 경우 새로운 URL을 사용하세요.</li>
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <a 
          href="/" 
          style={{ 
            color: 'white', 
            backgroundColor: '#007bff', 
            padding: '10px 20px', 
            textDecoration: 'none', 
            borderRadius: '5px',
            display: 'inline-block'
          }}
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
} 