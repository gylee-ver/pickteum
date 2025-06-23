import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { canonical } from '@/lib/metadata'

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다 - 픽틈',
  description: '요청하신 페이지를 찾을 수 없습니다. 픽틈 홈페이지로 돌아가서 다른 콘텐츠를 확인해보세요.',
  ...canonical('/404'),
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow px-4 py-12 flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-[#FFC83D] mb-4">404</h1>
            <h2 className="text-2xl font-bold text-[#212121] mb-4">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-[#767676] mb-8 leading-relaxed">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br />
              아래 버튼을 통해 홈페이지로 돌아가거나<br />
              다른 콘텐츠를 탐색해보세요.
            </p>
          </div>
          
          <div className="space-y-4 w-full max-w-sm">
            <Link
              href="/"
              className="block w-full bg-[#FFC83D] text-black py-3 px-6 rounded-lg font-medium hover:bg-[#FFB800] transition-colors"
            >
              홈페이지로 돌아가기
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/category/건강"
                className="block bg-white border border-gray-200 text-[#212121] py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                건강
              </Link>
              <Link
                href="/category/스포츠"
                className="block bg-white border border-gray-200 text-[#212121] py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                스포츠
              </Link>
              <Link
                href="/category/경제"
                className="block bg-white border border-gray-200 text-[#212121] py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                경제
              </Link>
              <Link
                href="/category/테크"
                className="block bg-white border border-gray-200 text-[#212121] py-2 px-4 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                테크
              </Link>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-[#767676]">
            <p>
              문제가 계속 발생한다면{' '}
              <Link href="/contact" className="text-[#FFC83D] hover:underline">
                고객센터
              </Link>
              로 문의해주세요.
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
} 