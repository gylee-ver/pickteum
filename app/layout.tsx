import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { ScrollButton } from "@/components/ui/scroll-button"
import OrganizationSchema from '@/components/organization-schema'
import WebsiteSchema from '@/components/website-schema'

const baseUrl = 'https://www.pickteum.com'

export const metadata: Metadata = {
  title: {
    template: '%s | 픽틈 - 틈새시간을 이슈충전 타임으로',
    default: '픽틈 - 틈새시간을 이슈충전 타임으로! 건강, 스포츠, 경제, 정치, 라이프, 테크 뉴스'
  },
  description: '바쁜 일상 속 틈새시간에 만나는 핵심 이슈! 건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 콘텐츠를 모바일에 최적화된 환경에서 빠르게 만나보세요.',
  generator: 'Next.js',
  applicationName: '픽틈',
  referrer: 'origin-when-cross-origin',
  keywords: [
    '픽틈', 'pickteum', '뉴스', '틈새시간', '이슈충전', '콘텐츠', '정보',
    '건강뉴스', '스포츠뉴스', '경제뉴스', '정치뉴스', '라이프뉴스', '테크뉴스',
    '모바일뉴스', '빠른뉴스', '핵심이슈', '트렌드', '시사', '정보매체',
    '뉴스앱', '뉴스사이트', '한국뉴스', '실시간뉴스', '뉴스포털'
  ],
  authors: [{ name: '픽틈', url: 'https://www.pickteum.com' }],
  creator: '픽틈',
  publisher: '픽틈',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: '픽틈 RSS 피드' }
      ]
    }
  },
  openGraph: {
    title: '픽틈 - 틈새시간을 이슈충전 타임으로!',
    description: '바쁜 일상 속 틈새시간에 만나는 핵심 이슈! 건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 뉴스와 콘텐츠를 제공합니다.',
    url: baseUrl,
    siteName: '픽틈',
    images: [
      {
        url: '/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '픽틈 - 틈새시간을 이슈충전 타임으로!',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '픽틈 - 틈새시간을 이슈충전 타임으로!',
    description: '바쁜 일상 속 틈새시간에 만나는 핵심 이슈! 다양한 분야의 뉴스와 콘텐츠를 제공합니다.',
    images: ['/pickteum_og.png'],
    creator: '@pickteum',
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
  },
  category: '뉴스',
  other: {
    'google-adsense-account': 'ca-pub-6018069358099295',
    'naver-site-verification': '42769cb438f20728e074ac6432888e234709d9af',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 구조화된 데이터 */}
        <OrganizationSchema />
        <WebsiteSchema />
        
        {/* 🔥 모바일 최적화 메타태그 (중복 제거 및 통합) */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* 🔧 성능 최적화 메타태그 */}
        <meta name="theme-color" content="#F2FF66" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* 🔥 구글 애드센스 메타태그 */}
        <meta name="google-adsense-account" content="ca-pub-6018069358099295" />
        
        {/* 🔥 구글 애드센스 스크립트 */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6018069358099295"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        
        {/* Google Analytics 4 - 픽틈 맞춤 설정 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8R9N5SG6WM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // 🔥 픽틈 맞춤 GA4 설정
            gtag('config', 'G-8R9N5SG6WM', {
              // 향상된 측정 활성화
              enhanced_measurements: {
                scrolls: true,
                outbound_clicks: true,
                site_search: false,
                video_engagement: false,
                file_downloads: true
              },
              
              // 뉴스 사이트 최적화 설정
              session_timeout: 1200, // 20분
              engagement_time_msec: 10000, // 10초 이상 체류시 참여로 간주
              
              // 페이지뷰 수동 제어
              send_page_view: false,
              debug_mode: true, // 개발 중에만 활성화
            });

            // 북극성 지표 추적용 전환 이벤트 설정
            gtag('event', 'conversion', {
              'send_to': 'G-8R9N5SG6WM/monthly_pageview_goal'
            });
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
      </head>
      <body>
        {children}
        <ScrollButton />
      </body>
    </html>
  )
}
