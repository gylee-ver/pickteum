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
  metadataBase: new URL('https://www.pickteum.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '틈 날 땐? 픽틈!',
    description: '당신의 정크 타임을, 스마일 타임으로!',
    url: 'https://www.pickteum.com',
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
    google: 'UmikrnCv44LHiK37WnbFGHjnqSYwTF6JJ',
    naver: '42769cb438f20728e074ac6432888e234709d9af',
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
        {/* 🔥 모바일 최적화 메타태그 추가 (기존 UI 영향 없음) */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Google Analytics 4 */}
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

        {/* Hotjar Tracking Code */}
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6415192,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
        
        {/* 네이버 서치어드바이저 메타태그 */}
        <meta name="naver-site-verification" content="42769cb438f20728e074ac6432888e234709d9af" />
        
        {/* 다음 서치어드바이저 메타태그 */}
        <meta name="kakao-site-verification" content="YOUR_CODE" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
