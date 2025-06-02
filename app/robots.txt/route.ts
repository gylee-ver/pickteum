import { NextResponse } from "next/server"

export async function GET() {
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
Allow: /sitemap-index.xml
Allow: /_next/image/*
Allow: /ads.txt

# 사이트맵 위치
Sitemap: https://www.pickteum.com/sitemap-index.xml
Sitemap: https://www.pickteum.com/sitemap.xml
Sitemap: https://www.pickteum.com/news-sitemap.xml

# 관리자 페이지 크롤링 방지
Disallow: /admin/
Disallow: /api/
Disallow: /_next/static/
Disallow: /debug-meta

# 이미지 크롤링 허용
User-agent: Googlebot-Image
Allow: /public/
Allow: /_next/image/*

# 구글 검색로봇 (Google Search Console)
User-agent: Googlebot
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
Allow: /ads.txt
# 🔥 단축 URL은 검색엔진 차단 (중복 콘텐츠 방지)
Disallow: /s/
Disallow: /admin/
Disallow: /api/

# 🔥 애드센스 크롤러 허용
User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

User-agent: AdsBot-Google-Mobile
Allow: /

# 네이버 검색로봇 (네이버 서치어드바이저)
User-agent: Yeti
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
# 🔥 단축 URL은 검색엔진 차단
Disallow: /s/
Disallow: /admin/
Disallow: /api/
Crawl-delay: 1

# 🔥 다음 검색로봇 (다음 웹마스터도구)
User-agent: Daum
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
Allow: /sitemap-index.xml
Allow: /category/
Allow: /article/
# 🔥 단축 URL은 검색엔진 차단
Disallow: /s/
Disallow: /admin/
Disallow: /api/
Disallow: /debug-meta
Crawl-delay: 1

# 🔥 추가: 다음카카오 모바일 검색로봇
User-agent: Daumoa
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
# 🔥 단축 URL은 검색엔진 차단
Disallow: /s/
Disallow: /admin/
Disallow: /api/
Crawl-delay: 1

# 구글 모바일 친화성 테스트 봇
User-agent: Chrome-Lighthouse
Allow: /

# 빙 검색로봇
User-agent: Bingbot
Allow: /
Allow: /sitemap.xml
# 🔥 단축 URL은 검색엔진 차단
Disallow: /s/
Disallow: /admin/
Disallow: /api/
Crawl-delay: 1

# 🔥 소셜 미디어 크롤러는 허용 (공유 기능 완전 보존)
User-agent: facebookexternalhit
Allow: /s/
Allow: /

User-agent: Facebot
Allow: /s/
Allow: /

User-agent: Twitterbot
Allow: /s/
Allow: /

User-agent: LinkedInBot
Allow: /s/
Allow: /

User-agent: WhatsApp
Allow: /s/
Allow: /

User-agent: Slackbot
Allow: /s/
Allow: /

User-agent: TelegramBot
Allow: /s/
Allow: /

User-agent: Discord
Allow: /s/
Allow: /`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
