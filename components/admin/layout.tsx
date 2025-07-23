"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Head from "next/head"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  FileText,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import supabase from '@/lib/supabase'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // 로그인 상태 확인 - 실제 구현 시 토큰 검증 등으로 대체
    const user = localStorage.getItem("pickteum_user") || sessionStorage.getItem("pickteum_user")
    if (!user && pathname !== "/admin/login") {
      router.push("/admin/login")
      return
    }
    setUserName(user)
    setIsLoading(false)
  }, [pathname, router])

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + 숫자 키로 메뉴 이동
      if (e.altKey && e.key >= "1" && e.key <= "6") {
        e.preventDefault()
        const index = Number.parseInt(e.key) - 1
        const routes = [
          "/admin/dashboard",
          "/admin/posts",
          "/admin/media",
          "/admin/analytics",
          "/admin/users",
          "/admin/settings",
        ]
        if (routes[index]) {
          router.push(routes[index])
        }
      }

      // Ctrl + / 로 사이드바 토글
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault()
        setIsSidebarCollapsed(!isSidebarCollapsed)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router, isSidebarCollapsed])

  const handleLogout = () => {
    // 로그아웃 처리 - 실제 구현 시 API 호출로 대체
    localStorage.removeItem("pickteum_user")
    sessionStorage.removeItem("pickteum_user")

    toast({
      title: "로그아웃 되었습니다.",
    })

    router.push("/admin/login")
  }

  // 로그인 페이지에서는 레이아웃을 적용하지 않음
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="w-64 bg-white border-r border-gray-200">
          <Skeleton className="h-16 w-full" />
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-16 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: "/admin/dashboard", icon: Home, label: "대시보드", shortcut: "Alt+1" },
    { href: "/admin/posts", icon: FileText, label: "콘텐츠 관리", shortcut: "Alt+2" },
    { href: "/admin/media", icon: ImageIcon, label: "미디어 라이브러리", shortcut: "Alt+3" },
    { href: "/admin/analytics", icon: BarChart3, label: "통계 분석", shortcut: "Alt+4" },
    { href: "/admin/settings", icon: Settings, label: "설정", shortcut: "Alt+6" },
  ]

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="flex min-h-screen bg-gray-50">
      {/* 모바일 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-gray-50 border-r border-gray-200 shadow-md transition-all duration-300 md:translate-x-0 md:static flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* 사이드바 헤더 */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <Link href="/admin/dashboard" className="flex items-center">
            {!isSidebarCollapsed ? (
              <div className="flex items-center">
                <Image src="/logo_vec.png" alt="Pickteum" width={32} height={32} className="mr-2" />
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <Image src="/logo_vec.png" alt="Pickteum" width={28} height={28} />
              </div>
            )}
          </Link>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? "확장" : "축소"}
            >
              {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* 사이드바 내비게이션 */}
        <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
          <TooltipProvider>
            {navItems.map((item) => {
              const isActive =
                item.href === pathname || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))

              return (
                <Tooltip key={item.href} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-gray-100 text-[#212121]"
                          : "text-[#767676] hover:bg-gray-100 hover:text-[#212121]",
                      )}
                    >
                      <item.icon size={18} className={cn("flex-shrink-0", isSidebarCollapsed ? "" : "mr-3")} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className={cn(isSidebarCollapsed ? "block" : "hidden")}>
                    <div>
                      <p>{item.label}</p>
                      <p className="text-xs text-gray-500">{item.shortcut}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>

        {/* 사이드바 푸터 */}
        <div
          className={cn(
            "p-4 border-t border-gray-200 shadow-sm flex-shrink-0 bg-white",
            isSidebarCollapsed ? "flex flex-col items-center" : "",
          )}
        >
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="truncate mr-2">
                  <p className="text-sm font-medium truncate">{userName}</p>
                  <p className="text-xs text-gray-500">관리자</p>
                </div>
                <Button variant="ghost" size="sm" className="flex-shrink-0">
                  <LogOut size={16} className="mr-1" />
                  <span className="truncate">로그아웃</span>
                </Button>
              </div>
              <Link href="/" className="text-xs text-gray-500 hover:text-[#FFC83D] block truncate">
                사이트로 이동
              </Link>
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>로그아웃</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </Button>
            <div className="text-sm font-medium text-gray-500 hidden md:block">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={18} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>알림</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User size={18} />
                  <span className="hidden md:inline truncate max-w-[100px]">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 md:p-6 flex-1 overflow-auto">{children}</main>

        <footer className="py-2 px-4 text-center text-xs text-gray-500 border-t border-gray-200">
          <p>© {new Date().getFullYear()} Pickteum Admin. 키보드 단축키: Ctrl+/ (사이드바 토글)</p>
        </footer>
      </div>
    </div>
    </>
  )
}
