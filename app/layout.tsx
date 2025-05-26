import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    template: '%s | 틈 날 땐? 픽틈!',
    default: '틈 날 땐? 픽틈!'
  },
  description: '당신의 정크 타임을, 스마일 타임으로!',
  generator: 'Next.js',
  applicationName: '픽틈',
  referrer: 'origin-when-cross-origin',
  keywords: ['픽틈', '뉴스', '정크타임', '스마일타임', '콘텐츠', '정보'],
  authors: [{ name: '픽틈' }],
  creator: '픽틈',
  publisher: '픽틈',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pickteum.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '틈 날 땐? 픽틈!',
    description: '당신의 정크 타임을, 스마일 타임으로!',
    url: 'https://pickteum.com',
    siteName: '픽틈',
    images: [
      {
        url: '/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '픽틈 - 당신의 정크 타임을, 스마일 타임으로!',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/pickteum_favicon.ico',
    shortcut: '/pickteum_favicon.ico',
    apple: '/pickteum_favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/pickteum_favicon.ico',
    },
  },
  verification: {
    google: 'google-site-verification=YOUR_CODE',
    naver: 'naver-site-verification=YOUR_CODE',
  },
  category: '뉴스',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8R9N5SG6WM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8R9N5SG6WM');
          `}
        </Script>
        
        {/* 네이버 서치어드바이저 메타태그 */}
        <meta name="naver-site-verification" content="YOUR_CODE" />
        
        {/* 다음 서치어드바이저 메타태그 */}
        <meta name="kakao-site-verification" content="YOUR_CODE" />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MJSWS58K"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  )
}
