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

# 네이버 검색로봇
User-agent: Yeti
Allow: /
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# 다음 검색로봇
User-agent: Daum
Allow: /
Allow: /sitemap.xml
Disallow: /admin/
Disallow: /api/

# 구글 모바일 친화성 테스트 봇
User-agent: Chrome-Lighthouse
Allow: /

# 구글 AdsBot
User-agent: AdsBot-Google
Allow: /
`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
