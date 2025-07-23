import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
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
        url: 'https://www.pickteum.com/pickteum_og.png',
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
    images: ['https://www.pickteum.com/pickteum_og.png'],
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
        
        {/* 🔥 Core Web Vitals 최적화 - 리소스 힌트 */}
        <link rel="preload" href="/pickteum_og.png" as="image" />
        <link rel="preload" href="/pickteum_favicon.ico" as="image" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        
        {/* 🔥 모바일 최적화 메타태그 (CLS 방지) */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* 🔧 성능 최적화 메타태그 */}
        <meta name="theme-color" content="#F2FF66" />

        {/* 🔥 Google AdSense - 광고 승인 및 수익화 */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6018069358099295"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Google Analytics 4 - 픽틈 맞춤 설정 (성능 최적화) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8R9N5SG6WM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            // 🔥 Core Web Vitals 최적화된 GA4 설정
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
              
              // 성능 최적화
              send_page_view: false, // 수동 제어로 성능 향상
              debug_mode: false, // 프로덕션에서는 비활성화
              
              // 🔥 Core Web Vitals 측정
              custom_map: {
                'custom_parameter_1': 'page_type',
                'custom_parameter_2': 'content_category'
              }
            });

            // 🔥 Core Web Vitals 측정 및 전송
            function sendCoreWebVitals() {
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((entryList) => {
                  for (const entry of entryList.getEntries()) {
                    gtag('event', 'core_web_vitals', {
                      event_category: 'performance',
                      metric_name: entry.name,
                      metric_value: Math.round(entry.value),
                      metric_rating: entry.rating || 'unknown'
                    });
                  }
                });
                
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
              }
            }
            
            // 페이지 로드 완료 후 측정 시작
            window.addEventListener('load', sendCoreWebVitals);
          `}
        </Script>

        {/* Hotjar Tracking Code (성능 최적화) */}
        <Script id="hotjar" strategy="lazyOnload">
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

        {/* 🔥 구글 애드센스 계정 확인용 메타태그 */}
        <meta name="google-adsense-account" content="ca-pub-6018069358099295" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
