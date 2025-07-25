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

# 🔥 SEO 최적화: 색인 가치가 없는 페이지 차단
Disallow: /404
Disallow: /admin/
Disallow: /api/
Disallow: /debug-meta
# 🔥 오류 페이지 차단
Disallow: /*?error=
# 🔥 빈 카테고리(게시글 0개) 공통 차단
Disallow: /*?empty=
Disallow: /*?count=0

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
# 🔥 단축 URL 제한적 허용 (소셜 미디어 공유 완전 보존하면서 색인 최적화)
Allow: /s/
Disallow: /s/*?*
Disallow: /404
Disallow: /admin/
Disallow: /api/
# 🔥 빈 카테고리(게시글 0개) 공통 차단
Disallow: /*?empty=
Disallow: /*?count=0

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
# 🔥 단축 URL 제한적 허용
Allow: /s/
Disallow: /s/*?*
Disallow: /404
Disallow: /admin/
Disallow: /api/
# 🔥 빈 카테고리(게시글 0개) 공통 차단
Disallow: /*?empty=
Disallow: /*?count=0
Crawl-delay: 1

# 🔥 다음 검색로봇 (다음 웹마스터도구)
User-agent: Daum
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
Allow: /sitemap-index.xml
Allow: /category/
Allow: /article/
# 🔥 단축 URL 제한적 허용
Allow: /s/
Disallow: /s/*?*
Disallow: /404
Disallow: /admin/
Disallow: /api/
Disallow: /debug-meta
# 🔥 빈 카테고리(게시글 0개) 공통 차단
Disallow: /*?empty=
Disallow: /*?count=0
Crawl-delay: 1

# 🔥 추가: 다음카카오 모바일 검색로봇
User-agent: Daumoa
Allow: /
Allow: /sitemap.xml
Allow: /news-sitemap.xml
# 🔥 단축 URL 제한적 허용
Allow: /s/
Disallow: /s/*?*
Disallow: /404
Disallow: /admin/
Disallow: /api/
# 🔥 빈 카테고리(게시글 0개) 공통 차단
Disallow: /*?empty=
Disallow: /*?count=0
Crawl-delay: 1

# 구글 모바일 친화성 테스트 봇
User-agent: Chrome-Lighthouse
Allow: /

# 빙 검색로봇
User-agent: Bingbot
Allow: /
Allow: /sitemap.xml
# 🔥 단축 URL 제한적 허용
Allow: /s/
Disallow: /s/*?*
Disallow: /404
Disallow: /admin/
Disallow: /api/
# 🔥 빈 카테고리(게시글 0개) 공통 차단
Disallow: /*?empty=
Disallow: /*?count=0
Crawl-delay: 1

# 🔥 소셜 미디어 크롤러는 완전 허용 (공유 기능 완전 보존)
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
