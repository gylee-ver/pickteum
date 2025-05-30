import Link from "next/link"
import { ArrowLeft, Users, MapPin, Clock, DollarSign, Briefcase, Star, Heart, Zap, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '채용정보',
  description: '픽틈과 함께 성장할 인재를 찾습니다. 다양한 포지션의 채용 정보를 확인해보세요.',
  alternates: {
    canonical: 'https://www.pickteum.com/careers',
  },
  openGraph: {
    title: '채용정보 - 틈 날 땐? 픽틈!',
    description: '픽틈과 함께 성장할 인재를 찾습니다. 다양한 포지션의 채용 정보를 확인해보세요.',
    type: 'website',
    url: 'https://www.pickteum.com/careers',
    siteName: '픽틈',
    images: [
      {
        url: 'https://www.pickteum.com/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '채용정보 - 픽틈',
      },
    ],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '채용정보 - 틈 날 땐? 픽틈!',
    description: '픽틈과 함께 성장할 인재를 찾습니다. 다양한 포지션의 채용 정보를 확인해보세요.',
    images: ['https://www.pickteum.com/pickteum_og.png'],
    creator: '@pickteum',
    site: '@pickteum',
  },
}

export default function CareersPage() {
  const jobOpenings = [
    {
      id: 1,
      title: "콘텐츠 에디터",
      department: "콘텐츠팀",
      type: "정규직",
      location: "서울 금천구",
      experience: "경력 2-5년",
      deadline: "2025.02.28",
      tags: ["콘텐츠 기획", "에디팅", "SEO"],
      description: "다양한 분야의 콘텐츠를 기획하고 편집하는 업무를 담당합니다."
    },
    {
      id: 2,
      title: "프론트엔드 개발자",
      department: "개발팀",
      type: "정규직",
      location: "서울 금천구",
      experience: "경력 3년 이상",
      deadline: "2025.03.15",
      tags: ["React", "Next.js", "TypeScript"],
      description: "사용자 경험을 개선하는 웹 프론트엔드 개발을 담당합니다."
    },
    {
      id: 3,
      title: "마케팅 매니저",
      department: "마케팅팀",
      type: "정규직",
      location: "서울 금천구",
      experience: "경력 3-7년",
      deadline: "2025.02.20",
      tags: ["디지털 마케팅", "SNS", "데이터 분석"],
      description: "브랜드 마케팅 전략 수립 및 실행을 담당합니다."
    }
  ]

  const benefits = [
    {
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      title: "경쟁력 있는 연봉",
      description: "업계 최고 수준의 연봉과 성과급 제공"
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: "유연근무제",
      description: "자율출퇴근제 및 재택근무 지원"
    },
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      title: "복리후생",
      description: "건강검진, 경조사비, 휴가비 지원"
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      title: "성장 지원",
      description: "교육비 지원 및 컨퍼런스 참가 기회"
    }
  ]

  const culture = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "혁신적 사고",
      description: "새로운 아이디어를 환영하고 실험을 장려합니다"
    },
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: "협업 문화",
      description: "서로 존중하며 함께 성장하는 팀워크를 추구합니다"
    },
    {
      icon: <Target className="h-5 w-5 text-green-500" />,
      title: "목표 지향",
      description: "명확한 목표 설정과 성과 달성을 중시합니다"
    }
  ]

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
            <h1 className="text-base font-medium text-[#212121] mx-auto">채용정보</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          {/* 헤더 섹션 */}
          <div className="text-center mb-8">
            <Briefcase className="h-12 w-12 text-[#FFC83D] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#212121] mb-2">픽틈과 함께 성장하세요</h2>
            <p className="text-sm text-[#767676] leading-relaxed">
              혁신적인 콘텐츠 플랫폼을 만들어갈<br/>
              열정적인 인재를 찾고 있습니다.
            </p>
          </div>

          {/* 회사 문화 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">회사 문화</h3>
            <div className="grid gap-3">
              {culture.map((item, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  {item.icon}
                  <div className="ml-3">
                    <h4 className="font-medium text-sm text-[#212121] mb-1">{item.title}</h4>
                    <p className="text-xs text-[#333333]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 복리후생 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">복리후생</h3>
            <div className="grid gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start p-4 bg-white border border-gray-200 rounded-lg">
                  {benefit.icon}
                  <div className="ml-3">
                    <h4 className="font-medium text-sm text-[#212121] mb-1">{benefit.title}</h4>
                    <p className="text-xs text-[#333333]">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 채용 공고 */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#212121]">채용 공고</h3>
              <Badge variant="secondary" className="bg-[#FFC83D]/20 text-[#FFC83D]">
                {jobOpenings.length}개 포지션
              </Badge>
            </div>
            
            <div className="space-y-4">
              {jobOpenings.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-base text-[#212121] mb-1">{job.title}</h4>
                      <p className="text-sm text-[#767676]">{job.department}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {job.type}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-[#333333] mb-3">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#767676] mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.experience}
                    </div>
                    <div className="flex items-center col-span-2">
                      <Clock className="h-3 w-3 mr-1" />
                      마감일: {job.deadline}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-[#FFC83D] hover:bg-[#FFB800] text-white">
                      지원하기
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      상세보기
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 지원 프로세스 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">지원 프로세스</h3>
            <div className="space-y-3">
              {[
                { step: "1", title: "서류 접수", desc: "이력서 및 포트폴리오 제출" },
                { step: "2", title: "서류 심사", desc: "1-2주 소요, 개별 연락" },
                { step: "3", title: "면접 진행", desc: "1차 실무진 면접, 2차 임원 면접" },
                { step: "4", title: "최종 합격", desc: "처우 협의 및 입사일 조율" }
              ].map((process, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#FFC83D] text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0">
                    {process.step}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-[#212121] mb-1">{process.title}</h4>
                    <p className="text-xs text-[#333333]">{process.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 지원 안내 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">지원 안내</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-sm text-[#212121] mb-3">📋 제출 서류</h4>
              <ul className="text-xs text-[#333333] space-y-1 mb-4">
                <li>• 이력서 (자유 양식)</li>
                <li>• 자기소개서</li>
                <li>• 포트폴리오 (해당 직무)</li>
                <li>• 경력증명서 (경력직)</li>
              </ul>
              
              <h4 className="font-medium text-sm text-[#212121] mb-3">📧 지원 방법</h4>
              <p className="text-xs text-[#333333] mb-2">
                이메일: <span className="font-medium">careers@pickteum.com</span>
              </p>
              <p className="text-xs text-[#333333] mb-4">
                제목: [지원직무] 이름_경력년수 (예: [콘텐츠에디터] 홍길동_3년)
              </p>
              
              <div className="bg-white p-3 rounded border border-blue-300">
                <p className="text-xs text-[#333333]">
                  <strong>💡 Tip:</strong> 지원하시는 직무와 관련된 경험이나 프로젝트를 구체적으로 작성해주시면 
                  더욱 좋은 평가를 받을 수 있습니다.
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-[#FFC83D]/10 to-[#FFB800]/10 p-6 rounded-lg border border-[#FFC83D]/20">
            <h3 className="text-lg font-semibold text-[#212121] mb-2">함께 성장할 준비가 되셨나요?</h3>
            <p className="text-sm text-[#767676] mb-4">
              픽틈에서 여러분의 꿈을 펼쳐보세요!
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/contact">
                <Button variant="outline" size="sm">문의하기</Button>
              </Link>
              <Button className="bg-[#FFC83D] hover:bg-[#FFB800] text-white" size="sm">
                지원서 보내기
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 