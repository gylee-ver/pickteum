import { NextResponse } from "next/server"

export async function GET() {
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# 사이트맵 위치
Sitemap: https://pickteum.com/sitemap.xml

# 관리자 페이지 크롤링 방지
Disallow: /admin/
`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
