import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SitemapPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-14 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
                <span className="sr-only">뒤로 가기</span>
              </Button>
            </Link>
            <h1 className="text-base font-medium text-[#212121] mx-auto">사이트맵</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          <div className="space-y-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#212121] mb-2">사이트맵</h2>
              <p className="text-sm text-[#767676]">픽틈의 모든 페이지를 한눈에 확인하실 수 있습니다.</p>
            </div>

            {/* 메인 섹션 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">메인</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>홈페이지</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
              </ul>
            </section>

            {/* 카테고리 섹션 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">카테고리</h3>
              <div className="grid grid-cols-2 gap-y-3">
                <Link href="/category/건강" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                  <div className="w-3 h-3 rounded-full mr-2 bg-[#4CAF50]"></div>
                  <span>건강</span>
                </Link>
                <Link href="/category/스포츠" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                  <div className="w-3 h-3 rounded-full mr-2 bg-[#2196F3]"></div>
                  <span>스포츠</span>
                </Link>
                <Link href="/category/정치시사" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                  <div className="w-3 h-3 rounded-full mr-2 bg-[#9C27B0]"></div>
                  <span>정치/시사</span>
                </Link>
                <Link href="/category/경제" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                  <div className="w-3 h-3 rounded-full mr-2 bg-[#FF9800]"></div>
                  <span>경제</span>
                </Link>
                <Link href="/category/라이프" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                  <div className="w-3 h-3 rounded-full mr-2 bg-[#FF5722]"></div>
                  <span>라이프</span>
                </Link>
                <Link href="/category/테크" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                  <div className="w-3 h-3 rounded-full mr-2 bg-[#607D8B]"></div>
                  <span>테크</span>
                </Link>
              </div>
            </section>

            {/* 회사 정보 섹션 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">회사 정보</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>회사 소개</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>문의하기</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>채용정보</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
              </ul>
            </section>

            {/* 정책 및 약관 섹션 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">정책 및 약관</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/terms" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>이용약관</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>개인정보처리방침</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="/youth-policy" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>청소년보호정책</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>사이트맵</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
              </ul>
            </section>

            {/* 관리자 섹션 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">관리자</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/admin/login" className="flex items-center text-sm text-[#333333] hover:text-[#FFC83D] transition-colors">
                    <span>관리자 로그인</span>
                    <ExternalLink size={12} className="ml-1" />
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="flex items-center text-sm text-[#767676] hover:text-[#FFC83D] transition-colors">
                    <span>관리자 대시보드</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">로그인 필요</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/posts" className="flex items-center text-sm text-[#767676] hover:text-[#FFC83D] transition-colors">
                    <span>콘텐츠 관리</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">로그인 필요</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/analytics" className="flex items-center text-sm text-[#767676] hover:text-[#FFC83D] transition-colors">
                    <span>분석</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">로그인 필요</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/media" className="flex items-center text-sm text-[#767676] hover:text-[#FFC83D] transition-colors">
                    <span>미디어 라이브러리</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">로그인 필요</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/settings" className="flex items-center text-sm text-[#767676] hover:text-[#FFC83D] transition-colors">
                    <span>설정</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">로그인 필요</span>
                  </Link>
                </li>
                <li>
                  <Link href="/admin/users" className="flex items-center text-sm text-[#767676] hover:text-[#FFC83D] transition-colors">
                    <span>사용자 관리</span>
                    <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">로그인 필요</span>
                  </Link>
                </li>
              </ul>
            </section>

            {/* 추가 정보 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">추가 정보</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-sm text-[#212121] mb-2">RSS 피드</h4>
                <p className="text-sm text-[#333333] mb-2">최신 콘텐츠를 RSS로 구독하실 수 있습니다.</p>
                <Link href="/rss.xml" className="text-sm text-[#FFC83D] hover:text-[#FFB800] transition-colors">
                  RSS 피드 구독하기 →
                </Link>
              </div>
            </section>

            {/* 연락처 정보 */}
            <section>
              <h3 className="text-lg font-semibold text-[#212121] mb-4 pb-2 border-b border-gray-200">연락처</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-[#333333] leading-relaxed">
                  <strong>주소:</strong> 서울특별시 강남구 테헤란로 123, 픽틈빌딩 8층<br/>
                  <strong>전화:</strong> 02-123-4567<br/>
                  <strong>이메일:</strong> contact@pickteum.com<br/>
                  <strong>고객센터:</strong> 평일 10:00-18:00 (점심시간 12:00-13:00 제외)
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
} 