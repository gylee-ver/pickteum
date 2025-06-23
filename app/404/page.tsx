'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Custom404Page() {
  const router = useRouter()
  
  useEffect(() => {
    // 🔥 /404 경로로 직접 접근한 경우 홈으로 영구 리다이렉트
    // 이는 이전에 잘못 색인된 /404 URL들을 정리하기 위함
    const timer = setTimeout(() => {
      router.replace('/')
    }, 3000) // 3초 후 자동 리다이렉트
    
    return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-[#212121] mb-4">
          페이지를 리다이렉트 중입니다...
        </h1>
        <p className="text-[#767676] mb-6">
          잠시 후 홈페이지로 이동합니다.
        </p>
        <div className="w-8 h-8 border-4 border-[#FFC83D] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
} 