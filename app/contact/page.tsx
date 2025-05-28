import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '문의하기',
  description: '픽틈에 대한 문의사항이나 제안사항을 보내주세요. 빠른 시일 내에 답변드리겠습니다.',
  openGraph: {
    title: '문의하기 - 틈 날 땐? 픽틈!',
    description: '픽틈에 대한 문의사항이나 제안사항을 보내주세요. 빠른 시일 내에 답변드리겠습니다.',
    type: 'website',
  },
}

export default function ContactPage() {
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
            <h1 className="text-base font-medium text-[#212121] mx-auto">문의하기</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-grow px-4 py-6">
          {/* 헤더 섹션 */}
          <div className="text-center mb-8">
            <MessageCircle className="h-12 w-12 text-[#FFC83D] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#212121] mb-2">문의하기</h2>
            <p className="text-sm text-[#767676] leading-relaxed">
              픽틈에 대한 문의사항이나 제안사항을 보내주세요.<br/>
              빠른 시일 내에 답변드리겠습니다.
            </p>
          </div>

          {/* 연락처 정보 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">연락처 정보</h3>
            <div className="grid gap-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-[#FFC83D] mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">이메일</h4>
                  <p className="text-sm text-[#333333]">privacy@pickteum.com</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-[#FFC83D] mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">전화번호</h4>
                  <p className="text-sm text-[#333333]">02-123-4567</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-[#FFC83D] mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">주소</h4>
                  <p className="text-sm text-[#333333]">서울특별시 금천구 범안로 1212, 31층</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-[#FFC83D] mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm text-[#212121] mb-1">운영시간</h4>
                  <p className="text-sm text-[#333333]">평일 09:00 - 18:00 (주말 및 공휴일 휴무)</p>
                </div>
              </div>
            </div>
          </section>

          {/* 문의 양식 */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">문의 양식</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <Input id="name" placeholder="이름을 입력하세요" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <Input id="email" type="email" placeholder="이메일을 입력하세요" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input id="phone" type="tel" placeholder="연락처를 입력하세요" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">문의 유형 *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="문의 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">일반 문의</SelectItem>
                    <SelectItem value="content">콘텐츠 관련</SelectItem>
                    <SelectItem value="technical">기술 지원</SelectItem>
                    <SelectItem value="partnership">제휴 문의</SelectItem>
                    <SelectItem value="advertising">광고 문의</SelectItem>
                    <SelectItem value="feedback">피드백/제안</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">제목 *</Label>
                <Input id="subject" placeholder="문의 제목을 입력하세요" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">문의 내용 *</Label>
                <Textarea 
                  id="message" 
                  placeholder="문의 내용을 자세히 입력해주세요" 
                  rows={6}
                  required 
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm text-[#212121] mb-2">개인정보 수집 및 이용 동의</h4>
                <p className="text-xs text-[#333333] mb-3">
                  문의 처리를 위해 개인정보(이름, 이메일, 연락처)를 수집하며, 
                  문의 완료 후 즉시 파기됩니다.
                </p>
                <label className="flex items-center text-sm">
                  <input type="checkbox" className="mr-2" required />
                  <span className="text-[#333333]">개인정보 수집 및 이용에 동의합니다. (필수)</span>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FFC83D] hover:bg-[#FFB800] text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                문의 보내기
              </Button>
            </form>
          </section>

          {/* FAQ */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">자주 묻는 질문</h3>
            <div className="space-y-3">
              {[
                {
                  q: "콘텐츠 제보는 어떻게 하나요?",
                  a: "이메일(privacy@pickteum.com)로 제보 내용과 출처를 함께 보내주시면 검토 후 반영하겠습니다."
                },
                {
                  q: "광고 문의는 어떻게 하나요?",
                  a: "광고 문의는 문의 유형에서 '광고 문의'를 선택하여 보내주시거나 직접 이메일로 연락주세요."
                },
                {
                  q: "콘텐츠 이용 권한은 어떻게 되나요?",
                  a: "픽틈의 모든 콘텐츠는 저작권법의 보호를 받습니다. 상업적 이용 시 사전 허가가 필요합니다."
                },
                {
                  q: "답변은 얼마나 걸리나요?",
                  a: "일반적으로 영업일 기준 1-2일 내에 답변드리며, 복잡한 문의는 최대 5일까지 소요될 수 있습니다."
                }
              ].map((faq, index) => (
                <details key={index} className="bg-gray-50 rounded-lg">
                  <summary className="p-4 cursor-pointer font-medium text-sm text-[#212121] hover:bg-gray-100 rounded-lg">
                    {faq.q}
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-[#333333] leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* 추가 안내 */}
          <div className="bg-gradient-to-r from-[#FFC83D]/10 to-[#FFB800]/10 p-4 rounded-lg border border-[#FFC83D]/20">
            <h4 className="font-medium text-sm text-[#212121] mb-2">💡 빠른 답변을 위한 팁</h4>
            <ul className="text-xs text-[#333333] space-y-1">
              <li>• 문의 유형을 정확히 선택해주세요</li>
              <li>• 구체적인 상황과 문제점을 명시해주세요</li>
              <li>• 스크린샷이나 관련 자료가 있다면 함께 첨부해주세요</li>
              <li>• 연락 가능한 시간대를 알려주시면 더욱 빠른 응답이 가능합니다</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
} 