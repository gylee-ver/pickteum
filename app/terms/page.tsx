import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"

export default function TermsPage() {
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
            <h1 className="text-base font-medium text-[#212121] mx-auto">이용약관</h1>
            <div className="w-10"></div> {/* 버튼 밸런스를 위한 공간 */}
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          <div className="prose prose-sm max-w-none">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#212121] mb-2">픽틈 서비스 이용약관</h2>
              <p className="text-sm text-[#767676]">시행일자: 2025년 1월 1일</p>
            </div>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제1조 (목적)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                이 약관은 스튜디오시운(이하 "회사")이 제공하는 픽틈 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자 간의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제2조 (정의)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>"서비스"라 함은 회사가 제공하는 픽틈 플랫폼 및 관련 서비스 일체를 의미합니다.</li>
                <li>"이용자"라 함은 회사의 서비스에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 받는 자를 말합니다.</li>
                <li>"회원"이라 함은 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                <li>"콘텐츠"라 함은 회사가 서비스에서 제공하는 게시물, 문서, 그림, 음성, 화상, 소프트웨어 등 모든 정보를 말합니다.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제3조 (약관의 효력 및 변경)</h3>
              <ol className="list-decimal pl-6 space-y-3 text-sm text-[#333333]">
                <li>본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</li>
                <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 약관이 변경된 경우에는 지체없이 이를 공지하거나 통지합니다.</li>
                <li>회사가 전항에 따라 개정약관을 공지 또는 통지하면서 이용자에게 30일 기간 내에 의사표시를 하지 않으면 의사표시가 표명된 것으로 본다는 뜻을 명확하게 공지 또는 통지하였음에도 이용자가 명시적으로 거부의 의사표시를 하지 아니한 경우 이용자가 개정약관에 동의한 것으로 봅니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제4조 (서비스의 제공)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">회사는 다음과 같은 서비스를 제공합니다.</p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>건강, 스포츠, 정치/시사, 경제, 라이프, 테크 등 다양한 분야의 콘텐츠 제공</li>
                <li>개인화된 콘텐츠 추천 서비스</li>
                <li>뉴스레터 및 알림 서비스</li>
                <li>기타 회사가 정하는 서비스</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제5조 (서비스 이용료)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                회사가 제공하는 서비스는 기본적으로 무료입니다. 단, 특별한 서비스의 경우 별도의 이용료가 발생할 수 있으며, 이 경우 사전에 명시적으로 고지합니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제6조 (이용자의 의무)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">이용자는 다음 행위를 하여서는 안됩니다.</p>
              <ul className="list-disc pl-6 space-y-2 text-sm text-[#333333]">
                <li>신청 또는 변경시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제7조 (저작권의 귀속 및 이용제한)</h3>
              <ol className="list-decimal pl-6 space-y-3 text-sm text-[#333333]">
                <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
                <li>이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제8조 (손해배상)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실에 의한 경우를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
              </p>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제9조 (면책조항)</h3>
              <ol className="list-decimal pl-6 space-y-3 text-sm text-[#333333]">
                <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                <li>회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며 기타 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-semibold text-[#212121] mb-4">제10조 (관할법원)</h3>
              <p className="text-sm text-[#333333] leading-relaxed mb-4">
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 전속관할 법원으로 합니다.
              </p>
            </section>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <p className="text-xs text-[#767676]">
                본 약관은 2025년 1월 1일부터 시행됩니다.<br/>
                본 약관에 대한 문의사항이 있으시면 고객센터(02-123-4567)로 연락주시기 바랍니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: '이용약관',
  description: '픽틈 서비스 이용약관을 확인하세요.',
  alternates: {
    canonical: 'https://www.pickteum.com/terms',
  },
  openGraph: {
    title: '이용약관 - 틈 날 땐? 픽틈!',
    description: '픽틈 서비스 이용약관을 확인하세요.',
    type: 'website',
    url: 'https://www.pickteum.com/terms',
    siteName: '픽틈',
    images: [
      {
        url: 'https://www.pickteum.com/pickteum_og.png',
        width: 1200,
        height: 630,
        alt: '이용약관 - 픽틈',
      },
    ],
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '이용약관 - 틈 날 땐? 픽틈!',
    description: '픽틤 서비스 이용약관을 확인하세요.',
    images: ['https://www.pickteum.com/pickteum_og.png'],
    creator: '@pickteum',
    site: '@pickteum',
  },
} 