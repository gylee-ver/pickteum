import Link from 'next/link'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  description: '요청하신 페이지를 찾을 수 없습니다. 홈페이지로 돌아가거나 다른 콘텐츠를 탐색해보세요.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
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
            <h1 className="text-base font-medium text-[#212121] mx-auto">페이지를 찾을 수 없습니다</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-24 h-24 bg-[#FFC83D]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-[#FFC83D]" />
              </div>
              <h2 className="text-2xl font-bold text-[#212121] mb-4">
                페이지를 찾을 수 없습니다
              </h2>
              <p className="text-[#767676] leading-relaxed mb-8">
                요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br/>
                URL을 다시 확인하거나 홈페이지에서 원하는 콘텐츠를 찾아보세요.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-[#FFC83D] hover:bg-[#FFB800] text-white">
                  <Home className="w-4 h-4 mr-2" />
                  홈페이지로 돌아가기
                </Button>
              </Link>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="/category/건강">
                  <Button variant="outline" size="sm" className="w-full">
                    건강
                  </Button>
                </Link>
                <Link href="/category/스포츠">
                  <Button variant="outline" size="sm" className="w-full">
                    스포츠
                  </Button>
                </Link>
                <Link href="/category/경제">
                  <Button variant="outline" size="sm" className="w-full">
                    경제
                  </Button>
                </Link>
                <Link href="/category/테크">
                  <Button variant="outline" size="sm" className="w-full">
                    테크
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-[#767676]">
                문제가 지속되면{' '}
                <Link href="/contact" className="text-[#FFC83D] hover:underline">
                  고객센터
                </Link>
                로 문의해주세요.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 