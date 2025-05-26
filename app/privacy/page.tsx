import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
            <h1 className="text-base font-medium text-[#212121] mx-auto">개인정보처리방침</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          <div className="prose prose-sm max-w-none">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#212121] mb-2">개인정보처리방침</h2>
              <p className="text-sm text-[#767676]">시행일자: 2025년 1월 1일</p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">1. 개인정보의 처리목적</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                스튜디오시운(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리</li>
                <li>물품 또는 서비스 공급에 따른 금액 결제, 물품 또는 서비스의 공급·배송</li>
                <li>고충처리 목적</li>
                <li>마케팅 및 광고에의 활용</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">2. 개인정보의 처리 및 보유기간</h3>
              <ol className="list-decimal pl-6 space-y-3 text-sm text-[#333333]">
                <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
                <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>회원가입 및 관리: 서비스 이용계약 또는 회원가입 해지시까지</li>
                    <li>재화 또는 서비스 제공: 재화·서비스 공급완료 및 요금결제·정산 완료시까지</li>
                    <li>불만처리: 불만처리 완료일로부터 3년</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">3. 처리하는 개인정보의 항목</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="font-semibold text-sm text-[#212121] mb-2">필수항목</h4>
                <p className="text-sm text-[#333333]">이메일, 비밀번호, 이름, 생년월일, 성별</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="font-semibold text-sm text-[#212121] mb-2">선택항목</h4>
                <p className="text-sm text-[#333333]">전화번호, 관심분야, 직업</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-sm text-[#212121] mb-2">자동수집항목</h4>
                <p className="text-sm text-[#333333]">IP주소, 쿠키, MAC주소, 서비스 이용기록, 방문기록, 불량 이용기록 등</p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">4. 개인정보의 제3자 제공</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
              <p className="text-sm text-[#333333] leading-relaxed">
                현재 회사는 개인정보를 제3자에게 제공하고 있지 않습니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">5. 개인정보처리의 위탁</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-[#333333]">
                  <strong>위탁받는 자(수탁자):</strong> Amazon Web Services<br/>
                  <strong>위탁하는 업무의 내용:</strong> 클라우드 서비스 제공
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">6. 정보주체의 권리·의무 및 행사방법</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>개인정보 열람요구</li>
                <li>오류 등이 있을 경우 정정·삭제요구</li>
                <li>처리정지요구</li>
              </ul>
              <p className="text-sm text-[#333333] leading-relaxed mt-4">
                위의 권리 행사는 개인정보보호법 시행규칙 별지 제8호에 따라 작성하여 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">7. 개인정보의 안전성 확보조치</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">8. 개인정보보호책임자</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-[#333333] leading-relaxed">
                  <strong>개인정보보호책임자:</strong> 이건용<br/>
                  <strong>연락처:</strong> 02-123-4567, privacy@pickteum.com<br/>
                  <strong>부서명:</strong> 개발팀<br/>
                </p>
                <p className="text-sm text-[#333333] leading-relaxed mt-2">
                  정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보보호책임자에게 문의하실 수 있습니다.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">9. 개인정보 처리방침 변경</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#767676]">
                본 개인정보처리방침은 2025년 1월 1일부터 시행됩니다.<br/>
                개인정보 관련 문의사항이 있으시면 개인정보보호책임자에게 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 