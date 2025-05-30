import Link from "next/link"
import { ArrowLeft, Shield, Phone, Mail, AlertTriangle, Users, BookOpen, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
          <div className="space-y-6">
            {/* 헤더 섹션 */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-[#FFC83D] mr-2" />
                <h2 className="text-2xl font-bold text-[#212121]">청소년보호정책</h2>
              </div>
              <Badge variant="outline" className="mb-4">
                시행일자: 2025년 1월 1일
              </Badge>
              <p className="text-sm text-[#767676] leading-relaxed">
                스튜디오시운은 청소년이 건전한 인격체로 성장할 수 있도록<br/>
                유해한 매체물로부터 청소년을 보호합니다.
              </p>
            </div>

            {/* 회사 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-[#FFC83D]" />
                  회사 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#767676]">회사명</span>
                    <span className="text-[#212121] font-medium">스튜디오시운</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767676]">대표자</span>
                    <span className="text-[#212121] font-medium">이건용</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767676]">사업자등록번호</span>
                    <span className="text-[#212121] font-medium">506-24-52749</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767676]">주소</span>
                    <span className="text-[#212121] font-medium text-right">서울특별시 금천구 범안로 1212, 31층</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#767676]">통신판매업 신고번호</span>
                    <span className="text-[#212121] font-medium">2025-서울금천-0961</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 목적 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">1. 목적</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#333333] leading-relaxed">
                  스튜디오시운(이하 "회사")은 청소년이 건전한 인격체로 성장할 수 있도록 청소년에게 유해한 매체물로부터 청소년을 보호하는 것을 목적으로 본 정책을 수립합니다. 
                  픽틈 서비스를 통해 제공되는 모든 콘텐츠가 청소년에게 안전하고 교육적 가치를 제공할 수 있도록 최선을 다하겠습니다.
              </p>
              </CardContent>
            </Card>

            {/* 법적 근거 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">2. 법적 근거</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#333333] leading-relaxed mb-3">
                  본 정책은 다음 법령에 근거하여 수립되었습니다:
              </p>
                <ul className="space-y-2 text-sm text-[#333333]">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    「청소년 보호법」
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    「정보통신망 이용촉진 및 정보보호 등에 관한 법률」
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    「방송통신심의위원회 심의규정」
                  </li>
              </ul>
              </CardContent>
            </Card>

            {/* 보호 조치 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-[#FFC83D]" />
                  3. 청소년 보호 조치
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-[#212121] mb-2">콘텐츠 심의 및 관리</h4>
                  <ul className="space-y-1 text-sm text-[#333333]">
                    <li>• 모든 게시물에 대한 사전·사후 모니터링 실시</li>
                    <li>• 음란물, 폭력물 등 청소년 유해정보 게시 금지</li>
                    <li>• 건전한 콘텐츠 위주의 편집 정책 시행</li>
                    <li>• AI 기반 유해 콘텐츠 자동 탐지 시스템 운영</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-[#212121] mb-2">기술적 보호조치</h4>
                  <ul className="space-y-1 text-sm text-[#333333]">
                    <li>• 유해사이트 차단 소프트웨어 설치 권장</li>
                    <li>• 연령 확인 시스템을 통한 접근 제한</li>
                    <li>• 실시간 모니터링 및 자동 신고 시스템</li>
                    <li>• 안전한 브라우징 환경 제공</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sm text-[#212121] mb-2">교육 및 캠페인</h4>
                  <ul className="space-y-1 text-sm text-[#333333]">
                    <li>• 건전한 인터넷 이용문화 조성 캠페인</li>
                    <li>• 청소년 및 학부모 대상 온라인 안전교육</li>
                    <li>• 사이버 윤리 의식 제고 콘텐츠 제작</li>
                    <li>• 미디어 리터러시 교육 프로그램 운영</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 청소년보호책임자 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-[#FFC83D]" />
                  4. 청소년보호책임자
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#767676]">청소년보호책임자</span>
                      <span className="text-[#212121] font-medium">이건용</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#767676]">연락처</span>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-[#FFC83D]" />
                        <span className="text-[#212121] font-medium">02-6956-8866</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#767676]">이메일</span>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-[#FFC83D]" />
                        <span className="text-[#212121] font-medium">youth@pickteum.com</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#767676]">부서명</span>
                      <span className="text-[#212121] font-medium">콘텐츠관리팀</span>
                </div>
              </div>
                  <Separator />
                <p className="text-sm text-[#333333] leading-relaxed">
                  청소년보호책임자는 청소년 유해정보로부터 청소년을 보호하고 청소년의 안전한 인터넷 이용환경을 조성하기 위한 각종 정책을 수립·시행합니다.
                </p>
              </div>
              </CardContent>
            </Card>

            {/* 신고 및 처리절차 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-[#FFC83D]" />
                  5. 유해정보 신고 및 처리절차
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-[#212121] mb-3">신고방법</h4>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-4 h-4 mr-2 text-[#FFC83D]" />
                      <span className="text-sm text-[#333333]">전화: 02-6956-8866</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-4 h-4 mr-2 text-[#FFC83D]" />
                      <span className="text-sm text-[#333333]">이메일: report@pickteum.com</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className="w-4 h-4 mr-2 text-[#FFC83D]" />
                      <span className="text-sm text-[#333333]">온라인: 각 게시물 하단의 신고버튼 이용</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-[#212121] mb-3">처리절차</h4>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between text-xs text-[#333333] mb-2">
                      <span className="bg-white px-2 py-1 rounded">신고접수</span>
                      <span>→</span>
                      <span className="bg-white px-2 py-1 rounded">내용확인</span>
                      <span>→</span>
                      <span className="bg-white px-2 py-1 rounded">조치결정</span>
                      <span>→</span>
                      <span className="bg-white px-2 py-1 rounded">결과통보</span>
                    </div>
                    <ul className="space-y-1 text-sm text-[#333333] mt-3">
                      <li>• 신고된 내용은 24시간 이내에 검토하여 조치</li>
                      <li>• 중대한 사안의 경우 즉시 임시조치 후 상세검토 진행</li>
                      <li>• 처리 결과는 신고자에게 개별 통보</li>
                  </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 학부모의 역할 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">6. 학부모의 역할</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-[#333333] leading-relaxed mb-3">
                    학부모는 자녀의 건전한 정보 이용을 위해 다음과 같은 역할을 할 수 있습니다:
                  </p>
                  <ul className="space-y-2 text-sm text-[#333333]">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      자녀의 인터넷 이용 시간 및 방법 지도
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      유해 차단 소프트웨어 설치 및 관리
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      자녀와 인터넷 이용 규칙 정하기
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      건전한 사이트 이용 지도 및 교육
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-[#FFC83D] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      정기적인 이용내역 점검 및 소통
                </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* 관련기관 연락처 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">7. 관련기관 연락처</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-[#212121] mb-1">방송통신심의위원회</p>
                  <p className="text-xs text-[#333333]">전화: 02-750-1200 | 홈페이지: www.kocsc.or.kr</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-[#212121] mb-1">한국인터넷진흥원</p>
                  <p className="text-xs text-[#333333]">전화: 118 | 홈페이지: www.kisa.or.kr</p>
              </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-[#212121] mb-1">청소년사이버상담센터</p>
                  <p className="text-xs text-[#333333]">전화: 1388 | 홈페이지: www.kyci.or.kr</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-[#212121] mb-1">청소년보호위원회</p>
                  <p className="text-xs text-[#333333]">전화: 02-2100-6000 | 홈페이지: www.nypi.re.kr</p>
                </div>
              </CardContent>
            </Card>

            {/* 정책 변경 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">8. 정책 변경</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#333333] leading-relaxed">
                  본 청소년보호정책은 관련 법령이나 회사 정책의 변경에 따라 수정될 수 있으며, 변경 시에는 최소 7일 전에 홈페이지를 통해 공지합니다. 
                  중요한 변경사항의 경우 이메일 또는 서비스 내 알림을 통해 별도로 안내드립니다.
                </p>
              </CardContent>
            </Card>

            {/* 하단 안내 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">청소년 보호를 위한 약속</p>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    스튜디오시운은 청소년이 안전하고 건전한 환경에서 양질의 콘텐츠를 이용할 수 있도록 지속적으로 노력하겠습니다. 
                    청소년보호 관련 문의사항이 있으시면 언제든지 청소년보호책임자에게 연락주시기 바랍니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-[#767676]">
                본 청소년보호정책은 2025년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 