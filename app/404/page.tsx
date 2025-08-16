import { notFound } from 'next/navigation'

export default function Custom404Page() {
  // 🔥 /404는 표준 404 상태로 처리하여 소프트 404 오인 방지
  notFound()
}