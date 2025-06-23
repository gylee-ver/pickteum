import { Metadata } from 'next'
import Link from "next/link"
import Image from 'next/image'
import { ArrowLeft, Users, Target, Award, Heart, Globe, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: '회사 소개',
  description: '틈새 시간을, 이슈 충전 타임으로! 픽틈에 대해 알아보세요.',
  alternates: {
    canonical: 'https://www.pickteum.com/about',
  },
  openGraph: {
    title: '회사 소개 - 틈 날 땐? 픽틈!',
    description: '틈새 시간을, 이슈 충전 타임으로! 픽틈에 대해 알아보세요.',
    type: 'website',
    url: 'https://www.pickteum.com/about',
    siteName: '픽틈',
    images: [
      {
        url: 'https://www.pickteum.com/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '회사 소개 - 픽틈',
      },
    ],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '회사 소개 - 틈 날 땐? 픽틈!',
    description: '틈새 시간을, 이슈 충전 타임으로! 픽틈에 대해 알아보세요.',
    images: ['https://www.pickteum.com/pickteum_og.png'],
    creator: '@pickteum',
    site: '@pickteum',
  },
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
          {/* 히어로 섹션 */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <Image
                src="/logo_vec.png"
                alt="Pickteum Logo"
                width={120}
                height={48}
                className="h-12 w-auto mx-auto mb-4"
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-[#212121] mb-2">틈 날 땐? 픽틈!</h2>
            <p className="text-lg text-[#FFC83D] font-medium mb-4">틈새 시간을, 이슈 충전 타임으로!</p>
            <p className="text-sm text-[#767676] leading-relaxed">
              바쁜 현대인들의 소중한 틈새 시간을 의미 있는 이슈 충전 타임으로 만들어주는 
              스마트한 콘텐츠 플랫폼입니다.
            </p>
          </div>

          {/* 미션 & 비전 */}
          <div className="grid gap-4 mb-8">
            <div className="bg-gradient-to-r from-[#FFC83D]/10 to-[#FFB800]/10 p-6 rounded-lg border border-[#FFC83D]/20">
              <div className="flex items-center mb-3">
                <Target className="h-5 w-5 text-[#FFC83D] mr-2" />
                <h3 className="text-lg font-semibold text-[#212121]">우리의 미션</h3>
              </div>
              <p className="text-sm text-[#333333] leading-relaxed">
                짧은 시간 안에 핵심적이고 유익한 정보를 제공하여, 
                여러분의 일상에 가치를 더하고 더 나은 선택을 할 수 있도록 돕습니다.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center mb-3">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-[#212121]">우리의 비전</h3>
              </div>
              <p className="text-sm text-[#333333] leading-relaxed">
                모든 사람이 언제 어디서나 쉽고 빠르게 양질의 정보에 접근할 수 있는 
                세상을 만들어 나갑니다.
              </p>
            </div>
          </div>

          {/* 핵심 가치 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              핵심 가치
            </h3>
            <div className="grid gap-3">
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Zap className="h-4 w-4 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">신속성</h4>
                  <p className="text-xs text-[#333333]">빠르게 변화하는 세상의 핵심 이슈를 실시간으로 전달합니다.</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Award className="h-4 w-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">신뢰성</h4>
                  <p className="text-xs text-[#333333]">검증된 정보만을 선별하여 정확하고 믿을 수 있는 콘텐츠를 제공합니다.</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <Users className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">사용자 중심</h4>
                  <p className="text-xs text-[#333333]">사용자의 관심사와 필요에 맞춘 개인화된 콘텐츠를 제공합니다.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 제공 서비스 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">제공 서비스</h3>
            <div className="grid gap-3">
              {[
                { name: "건강", desc: "일상에서 실천할 수 있는 건강 정보와 웰빙 팁", color: "#4CAF50" },
                { name: "스포츠", desc: "최신 스포츠 뉴스와 운동 관련 유용한 정보", color: "#2196F3" },
                { name: "정치/시사", desc: "쉽게 이해할 수 있는 시사 이슈와 정치 동향", color: "#9C27B0" },
                { name: "경제", desc: "개인 재정 관리와 경제 트렌드 분석", color: "#FF9800" },
                { name: "라이프", desc: "일상을 더 풍요롭게 만드는 라이프스타일 정보", color: "#FF5722" },
                { name: "테크", desc: "최신 기술 동향과 디지털 라이프 가이드", color: "#607D8B" },
              ].map((category) => (
                <div key={category.name} className="flex items-center p-4 bg-white border border-gray-200 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h4 className="font-medium text-sm text-[#212121] mb-1">{category.name}</h4>
                    <p className="text-xs text-[#333333]">{category.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 운영 정보 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">운영 정보</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid gap-2 text-sm">
                <div className="flex">
                  <span className="font-medium text-[#212121] w-20">운영사</span>
                  <span className="text-[#333333]">스튜디오시운</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-[#212121] w-20">대표</span>
                  <span className="text-[#333333]">이건용</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-[#212121] w-20">설립</span>
                  <span className="text-[#333333]">2025년</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-[#212121] w-20">주소</span>
                  <span className="text-[#333333]">서울특별시 금천구 범안로 1212, 31층</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-[#212121] w-20">업데이트</span>
                  <span className="text-[#333333]">매일 새로운 콘텐츠 업데이트</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-[#212121] w-20">문의</span>
                  <span className="text-[#333333]">privacy@pickteum.com</span>
                </div>
              </div>
            </div>
          </section>

          {/* 콘텐츠 정책 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">콘텐츠 정책</h3>
            <p className="text-sm text-[#333333] leading-relaxed mb-4">
              픽틈은 정확하고 신뢰할 수 있는 정보만을 제공합니다. 모든 콘텐츠는 전문가 검토를 거쳐 
              발행되며, 사용자에게 실질적인 도움이 되는 양질의 정보를 선별하여 제공합니다.
            </p>
            <ul className="space-y-2">
              {[
                "사실 확인을 통한 정확한 정보 제공",
                "전문가 감수를 통한 콘텐츠 품질 관리",
                "사용자 피드백을 반영한 지속적인 개선",
                "개인정보 보호 및 윤리적 콘텐츠 운영"
              ].map((item, index) => (
                <li key={index} className="flex items-center text-sm text-[#333333]">
                  <div className="w-1.5 h-1.5 bg-[#FFC83D] rounded-full mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-[#FFC83D]/10 to-[#FFB800]/10 p-6 rounded-lg border border-[#FFC83D]/20">
            <h3 className="text-lg font-semibold text-[#212121] mb-2">픽틈과 함께하세요!</h3>
            <p className="text-sm text-[#767676] mb-4">
              틈새 시간을 더욱 의미 있게 만들어보세요.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/contact">
                <Button variant="outline" size="sm">문의하기</Button>
              </Link>
              <Link href="/">
                <Button className="bg-[#FFC83D] hover:bg-[#FFB800] text-white" size="sm">
                  콘텐츠 보기
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 