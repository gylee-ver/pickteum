import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full bg-white border-t border-gray-100 mt-auto">
      <div className="w-full max-w-[480px] mx-auto px-4 py-8">
        {/* 뉴스레터 구독 */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-[#212121] mb-2">뉴스레터 구독</h3>
          <div className="flex gap-2">
            <Input type="email" placeholder="이메일 주소 입력" className="flex-1" />
            <Button className="bg-[#FFC83D] hover:bg-[#FFB800] text-white">구독하기</Button>
          </div>
        </div>

        {/* 푸터 링크 */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-[#212121] mb-3">카테고리</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/health" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  건강
                </Link>
              </li>
              <li>
                <Link href="/category/sports" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  스포츠
                </Link>
              </li>
              <li>
                <Link href="/category/politics" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  정치/시사
                </Link>
              </li>
              <li>
                <Link href="/category/economy" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  경제
                </Link>
              </li>
              <li>
                <Link href="/category/lifestyle" className="text-sm text-[#767676] hover:text-[#FFC83D]">
                  라이프
                </Link>
              </li>
              <li>
                <Link href="/category/tech" className="text-sm text-[#767676] hover:text-[#FFC83D]">
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
              <img
                src="/logo_vec.png"
                alt="Pickteum Logo"
                className="h-6 w-auto inline-block align-middle"
              />
            </Link>
            <Link href="/admin/login" className="text-sm font-medium text-[#FFC83D] hover:text-[#FFB800]">
              관리자 페이지
            </Link>
          </div>
          <p className="text-xs text-[#767676] mb-2">(주)스튜디오시운 | 대표: 이건용 | 사업자등록번호: 506-24-52749</p>
          <p className="text-xs text-[#767676] mb-2">서울특별시 금천구 범안로 1212, 31층</p>
          <p className="text-xs text-[#767676] mb-2">통신판매업 신고번호: 2025-서울금천-0961</p>
        </div>

        {/* 소셜 미디어 및 정책 링크 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex space-x-4 mb-4 md:mb-0">
            <Link href="https://facebook.com" aria-label="Facebook" className="text-[#767676] hover:text-[#FFC83D]">
              <Facebook size={20} />
            </Link>
            <Link href="https://instagram.com" aria-label="Instagram" className="text-[#767676] hover:text-[#FFC83D]">
              <Instagram size={20} />
            </Link>
            <Link href="https://twitter.com" aria-label="Twitter" className="text-[#767676] hover:text-[#FFC83D]">
              <Twitter size={20} />
            </Link>
            <Link href="https://youtube.com" aria-label="YouTube" className="text-[#767676] hover:text-[#FFC83D]">
              <Youtube size={20} />
            </Link>
          </div>
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
