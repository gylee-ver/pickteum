"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const MOCK_USERS = [
  { id: "pickteum1", password: "1595" },
  { id: "pickteum2", password: "1595" },
]

export default function LoginPage() {
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // 페이지 로드 시 애니메이션 효과
  useEffect(() => {
    setIsAnimating(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // 모킹 데이터로 로그인 검증 - 실제 구현 시 API 호출로 대체
      const user = MOCK_USERS.find((user) => user.id === userId && user.password === password)

      // 로그인 지연 시뮬레이션 (실제 API 호출 시 제거)
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (user) {
        // 로그인 성공 시 세션 저장 - 실제 구현 시 토큰 저장 등으로 대체
        if (rememberMe) {
          localStorage.setItem("pickteum_user", userId)
        } else {
          sessionStorage.setItem("pickteum_user", userId)
        }

        toast({
          title: "로그인 성공",
          description: `${userId}님 환영합니다.`,
        })

        router.push("/admin/dashboard")
      } else {
        setError("아이디 또는 비밀번호가 일치하지 않습니다.")
        toast({
          variant: "destructive",
          title: "로그인 실패",
          description: "아이디 또는 비밀번호를 확인해주세요.",
        })
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
      toast({
        variant: "destructive",
        title: "오류 발생",
        description: "서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div
        className={cn(
          "w-full max-w-[400px] transition-all duration-500 transform",
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6 transition-all duration-300 hover:scale-105">
              <Image src="/logo.png" alt="Pickteum Admin" width={160} height={80} priority />
            </div>
            <CardTitle className="text-2xl font-bold">
              <span className="text-[#212121]">관리자 </span>
              <span className="text-[#FFC83D]">로그인</span>
            </CardTitle>
            <CardDescription>계정 정보를 입력하여 관리자 페이지에 접속하세요.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">아이디</Label>
                <div className="relative">
                  <Input
                    id="userId"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    autoComplete="username"
                    required
                    className={cn(error && "border-red-500 focus-visible:ring-red-500")}
                    aria-invalid={error ? "true" : "false"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">비밀번호</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-xs text-gray-500"
                    onClick={() =>
                      toast({
                        title: "비밀번호 찾기",
                        description: "관리자에게 문의하세요.",
                      })
                    }
                  >
                    비밀번호 찾기
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className={cn(error && "border-red-500 focus-visible:ring-red-500")}
                    aria-invalid={error ? "true" : "false"}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm" role="alert">
                  {error}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  로그인 상태 유지
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#FFC83D] hover:bg-[#FFB800] text-white transition-all duration-200 hover:shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    로그인 중...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" /> 로그인
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t p-4">
            <div className="text-xs text-gray-500 space-y-1 w-full">
              <p className="text-center font-medium mb-2">테스트 계정 정보</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-2 rounded text-center">
                  <p>ID: pickteum1</p>
                  <p>PW: 1595</p>
                </div>
                <div className="bg-gray-100 p-2 rounded text-center">
                  <p>ID: pickteum2</p>
                  <p>PW: 1595</p>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-4">
          © {new Date().getFullYear()} Pickteum Admin. All rights reserved.
        </p>
      </div>
    </div>
  )
}
