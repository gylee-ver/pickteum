import { NextResponse } from "next/server"

export async function GET() {
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /sitemap.xml
Allow: /_next/image/*

# 사이트맵 위치
Sitemap: https://pickteum.com/sitemap.xml

# 관리자 페이지 크롤링 방지
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# 이미지 크롤링 허용
User-agent: Googlebot-Image
Allow: /public/
Allow: /_next/image/*

# 구글 검색로봇 (Google Search Console)
User-agent: Googlebot
Allow: /
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# 네이버 검색로봇 (네이버 서치어드바이저)
User-agent: Yeti
Allow: /
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# 다음 검색로봇 (다음 웹마스터도구)
User-agent: Daum
Allow: /
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# 다음 웹마스터도구 인증
# 2^5Bj!Q8eDuJ

# 구글 모바일 친화성 테스트 봇
User-agent: Chrome-Lighthouse
Allow: /

# 구글 AdsBot
User-agent: AdsBot-Google
Allow: /

# 빙 검색로봇
User-agent: Bingbot
Allow: /
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# 크롤 딜레이 설정 (서버 부하 방지)
Crawl-delay: 1
`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
