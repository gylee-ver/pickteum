import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function YouthPolicyPage() {
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
            <h1 className="text-base font-medium text-[#212121] mx-auto">청소년보호정책</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          <div className="prose prose-sm max-w-none">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#212121] mb-2">청소년보호정책</h2>
              <p className="text-sm text-[#767676]">시행일자: 2025년 1월 1일</p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">1. 목적</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                주식회사 픽틈(이하 "회사")은 청소년이 건전한 인격체로 성장할 수 있도록 청소년에게 유해한 매체물로부터 청소년을 보호하는 것을 목적으로 본 정책을 수립합니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">2. 법적 근거</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                본 정책은 「청소년 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「방송통신심의위원회 심의규정」 등 관련 법령에 근거하여 수립되었습니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">3. 청소년 유해매체물 차단</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                회사는 청소년에게 유해한 매체물이 노출되지 않도록 다음과 같은 조치를 취합니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>청소년 유해매체물에 대한 라벨링 및 필터링 시스템 구축</li>
                <li>선정적이고 폭력적인 내용 등 청소년에게 유해한 정보에 대한 접근 제한</li>
                <li>건전한 인터넷 문화 조성을 위한 이용자 신고 시스템 운영</li>
                <li>청소년 보호를 위한 기술적 장치 설치 및 운영</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">4. 유해정보로부터의 청소년보호 방법</h3>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-semibold text-sm text-[#212121] mb-2">4.1 콘텐츠 심의 및 관리</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-[#333333]">
                    <li>모든 게시물에 대한 사전·사후 모니터링 실시</li>
                    <li>음란물, 폭력물 등 청소년 유해정보 게시 금지</li>
                    <li>건전한 콘텐츠 위주의 편집 정책 시행</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="font-semibold text-sm text-[#212121] mb-2">4.2 기술적 보호조치</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-[#333333]">
                    <li>유해사이트 차단 소프트웨어 설치 권장</li>
                    <li>성인인증 시스템을 통한 연령 확인</li>
                    <li>자동 신고 시스템을 통한 실시간 모니터링</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md">
                  <h4 className="font-semibold text-sm text-[#212121] mb-2">4.3 이용자 교육</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-[#333333]">
                    <li>건전한 인터넷 이용문화 조성을 위한 캠페인 실시</li>
                    <li>청소년 및 학부모 대상 온라인 안전교육 제공</li>
                    <li>사이버 윤리 의식 제고를 위한 콘텐츠 제작</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">5. 청소년보호책임자</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-[#333333] leading-relaxed">
                  <strong>청소년보호책임자:</strong> 최민준<br/>
                  <strong>연락처:</strong> 02-123-4567<br/>
                  <strong>이메일:</strong> youth@pickteum.com<br/>
                  <strong>부서명:</strong> 콘텐츠관리팀<br/>
                </p>
                <p className="text-sm text-[#333333] leading-relaxed mt-2">
                  청소년보호책임자는 청소년 유해정보로부터 청소년을 보호하고 청소년의 안전한 인터넷 이용환경을 조성하기 위한 각종 정책을 수립·시행합니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">6. 유해정보 신고 및 처리절차</h3>
              <ol className="list-decimal pl-6 space-y-3 text-sm text-[#333333]">
                <li>
                  <strong>신고방법</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>전화: 02-123-4567</li>
                    <li>이메일: report@pickteum.com</li>
                    <li>온라인 신고센터: 각 게시물 하단의 신고버튼 이용</li>
                  </ul>
                </li>
                <li>
                  <strong>처리절차</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>신고접수 → 내용확인 → 사실조사 → 조치결정 → 조치시행 → 결과통보</li>
                    <li>신고된 내용은 24시간 이내에 검토하여 조치</li>
                    <li>중대한 사안의 경우 즉시 임시조치 후 상세검토 진행</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">7. 학부모의 역할</h3>
              <div className="bg-orange-50 p-4 rounded-md">
                <p className="text-sm text-[#333333] leading-relaxed mb-3">
                  학부모는 자녀의 건전한 정보 이용을 위해 다음과 같은 역할을 할 수 있습니다.
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-[#333333]">
                  <li>자녀의 인터넷 이용 시간 및 방법 지도</li>
                  <li>유해 차단 소프트웨어 설치 및 관리</li>
                  <li>자녀와 인터넷 이용 규칙 정하기</li>
                  <li>건전한 사이트 이용 지도 및 교육</li>
                  <li>정기적인 이용내역 점검</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">8. 관련기관 연락처</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-[#212121]">방송통신심의위원회</p>
                  <p className="text-sm text-[#333333]">전화: 02-750-1200 | 홈페이지: www.kocsc.or.kr</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-[#212121]">한국인터넷진흥원</p>
                  <p className="text-sm text-[#333333]">전화: 118 | 홈페이지: www.kisa.or.kr</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-[#212121]">청소년사이버상담센터</p>
                  <p className="text-sm text-[#333333]">전화: 1388 | 홈페이지: www.kyci.or.kr</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">9. 정책 변경</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                본 청소년보호정책은 관련 법령이나 회사 정책의 변경에 따라 수정될 수 있으며, 변경 시에는 최소 7일 전에 홈페이지를 통해 공지합니다.
              </p>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#767676]">
                본 청소년보호정책은 2025년 1월 1일부터 시행됩니다.<br/>
                청소년보호 관련 문의사항이 있으시면 청소년보호책임자에게 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 