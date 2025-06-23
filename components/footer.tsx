import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto">
      <div className="w-full max-w-[480px] mx-auto px-4 py-8">
        {/* 푸터 링크 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-[#212121] mb-3">카테고리</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/건강" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  건강
                </Link>
              </li>
              <li>
                <Link href="/category/스포츠" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  스포츠
                </Link>
              </li>
              <li>
                <Link href={`/category/${encodeURIComponent('정치/시사')}`} className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  정치/시사
                </Link>
              </li>
              <li>
                <Link href="/category/경제" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  경제
                </Link>
              </li>
              <li>
                <Link href="/category/라이프" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  라이프
                </Link>
              </li>
              <li>
                <Link href="/category/테크" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  테크
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#212121] mb-3">회사</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  회사 소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  채용정보
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  관리자
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 회사 정보 및 정책 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo_vec.png"
                alt="Pickteum Logo"
                className="h-6 w-auto inline-block align-middle"
                width={24}
                height={24}
              />
            </Link>
            <Link href="/admin/login" className="text-sm font-medium text-[#FFC83D] hover:text-[#FFB800]">
              관리자 페이지
            </Link>
          </div>
          <p className="text-xs text-[#767676] mb-2">스튜디오시운 | 대표: 이건용 | 사업자등록번호: 506-24-52749</p>
          <p className="text-xs text-[#767676] mb-2">서울특별시 금천구 범안로 1212, 31층</p>
          <p className="text-xs text-[#767676] mb-2">통신판매업 신고번호: 2025-서울금천-0961</p>
        </div>

        {/* 정책 링크 */}
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/terms" className="text-xs text-[#767676] hover:text-[#FFC83D]">
              이용약관
            </Link>
            <Link href="/privacy" className="text-xs text-[#767676] hover:text-[#FFC83D]">
              개인정보처리방침
            </Link>
            <Link href="/youth-policy" className="text-xs text-[#767676] hover:text-[#FFC83D]">
              청소년보호정책
            </Link>
            <Link href="/sitemap.xml" className="text-xs text-[#767676] hover:text-[#FFC83D]">
              사이트맵
            </Link>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-[#767676] text-center">© {currentYear} Pickteum(픽틈). All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
