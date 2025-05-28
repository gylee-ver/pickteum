import { Metadata } from 'next'
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: '회사 소개',
  description: '틈새 시간을, 이슈 충전 타임으로! 픽틈에 대해 알아보세요.',
}

export default function AboutPage() {
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
            <h1 className="text-base font-medium text-[#212121] mx-auto">회사 소개</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          <div className="prose prose-sm max-w-none">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#212121] mb-2">픽틈 소개</h2>
              <p className="text-sm text-[#767676]">틈새 시간을, 이슈 충전 타임으로!</p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">우리의 미션</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                픽틈은 바쁜 현대인들의 틈새 시간을 의미 있는 이슈 충전 타임으로 만들어주는 콘텐츠 플랫폼입니다. 
                짧은 시간 안에 핵심적이고 유익한 정보를 제공하여, 여러분의 일상에 가치를 더합니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제공 서비스</h3>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li><strong>건강:</strong> 일상에서 실천할 수 있는 건강 정보와 웰빙 팁</li>
                <li><strong>스포츠:</strong> 최신 스포츠 뉴스와 운동 관련 유용한 정보</li>
                <li><strong>정치/시사:</strong> 쉽게 이해할 수 있는 시사 이슈와 정치 동향</li>
                <li><strong>경제:</strong> 개인 재정 관리와 경제 트렌드 분석</li>
                <li><strong>라이프:</strong> 일상을 더 풍요롭게 만드는 라이프스타일 정보</li>
                <li><strong>테크:</strong> 최신 기술 동향과 디지털 라이프 가이드</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">운영 정보</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-[#333333] leading-relaxed">
                  <strong>운영사:</strong> 스튜디오시운<br/>
                  <strong>설립:</strong> 2025년<br/>
                  <strong>주요 서비스:</strong> 콘텐츠 큐레이션 및 정보 제공<br/>
                  <strong>업데이트:</strong> 매일 새로운 콘텐츠 업데이트<br/>
                  <strong>문의:</strong> privacy@pickteum.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">콘텐츠 정책</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                픽틈은 정확하고 신뢰할 수 있는 정보만을 제공합니다. 모든 콘텐츠는 전문가 검토를 거쳐 
                발행되며, 사용자에게 실질적인 도움이 되는 양질의 정보를 선별하여 제공합니다.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-[#333333]">
                <li>사실 확인을 통한 정확한 정보 제공</li>
                <li>전문가 감수를 통한 콘텐츠 품질 관리</li>
                <li>사용자 피드백을 반영한 지속적인 개선</li>
                <li>개인정보 보호 및 윤리적 콘텐츠 운영</li>
              </ul>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#767676]">
                픽틈과 함께 틈새 시간을 더욱 의미 있게 만들어보세요.<br/>
                문의사항이 있으시면 언제든 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 