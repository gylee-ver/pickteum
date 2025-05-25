import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회사 소개 | 픽틈',
  description: '픽틈에 대해 알아보세요.',
}

export default function AboutPage() {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">픽틈 소개</h1>
        <p className="text-gray-600">당신의 정크 타임을, 스마일 타임으로!</p>
      </div>
    </div>
  )
} 