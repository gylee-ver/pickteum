"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Mail,
  Lock,
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const MOCK_USERS = [
  {
    id: "1",
    name: "김관리자",
    email: "admin@pickteum.com",
    role: "admin",
    status: "active",
    lastLogin: "2025-05-10T09:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    avatar: null,
  },
  {
    id: "2",
    name: "이에디터",
    email: "editor@pickteum.com",
    role: "editor",
    status: "active",
    lastLogin: "2025-05-09T14:30:00Z",
    createdAt: "2025-01-15T00:00:00Z",
    avatar: null,
  },
  {
    id: "3",
    name: "박작가",
    email: "writer@pickteum.com",
    role: "writer",
    status: "active",
    lastLogin: "2025-05-08T11:20:00Z",
    createdAt: "2025-02-01T00:00:00Z",
    avatar: null,
  },
  {
    id: "4",
    name: "최마케팅",
    email: "marketing@pickteum.com",
    role: "marketing",
    status: "active",
    lastLogin: "2025-05-07T16:45:00Z",
    createdAt: "2025-02-15T00:00:00Z",
    avatar: null,
  },
  {
    id: "5",
    name: "정디자인",
    email: "design@pickteum.com",
    role: "designer",
    status: "inactive",
    lastLogin: "2025-04-20T10:15:00Z",
    createdAt: "2025-03-01T00:00:00Z",
    avatar: null,
  },
  {
    id: "6",
    name: "한개발",
    email: "developer@pickteum.com",
    role: "developer",
    status: "active",
    lastLogin: "2025-05-06T09:30:00Z",
    createdAt: "2025-03-15T00:00:00Z",
    avatar: null,
  },
  {
    id: "7",
    name: "윤마케터",
    email: "marketer@pickteum.com",
    role: "marketing",
    status: "pending",
    lastLogin: null,
    createdAt: "2025-05-01T00:00:00Z",
    avatar: null,
  },
  {
    id: "8",
    name: "송에디터",
    email: "editor2@pickteum.com",
    role: "editor",
    status: "suspended",
    lastLogin: "2025-04-15T14:20:00Z",
    createdAt: "2025-04-01T00:00:00Z",
    avatar: null,
  },
]

// 사용자 활동 로그 모킹 데이터
const MOCK_USER_LOGS = [
  {
    id: "1",
    userId: "1",
    action: "login",
    description: "로그인 성공",
    ip: "192.168.1.1",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-05-10T09:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    action: "content_create",
    description: "새 콘텐츠 작성: '건강한 식습관으로 면역력 높이는 7가지 방법'",
    ip: "192.168.1.1",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-05-10T10:15:00Z",
  },
  {
    id: "3",
    userId: "2",
    action: "login",
    description: "로그인 성공",
    ip: "192.168.1.2",
    userAgent: "Firefox/97.0",
    timestamp: "2025-05-09T14:30:00Z",
  },
  {
    id: "4",
    userId: "2",
    action: "content_edit",
    description: "콘텐츠 수정: '2025 프로야구 시즌 전망: 주목해야 할 신인 선수들'",
    ip: "192.168.1.2",
    userAgent: "Firefox/97.0",
    timestamp: "2025-05-09T15:45:00Z",
  },
  {
    id: "5",
    userId: "3",
    action: "login",
    description: "로그인 성공",
    ip: "192.168.1.3",
    userAgent: "Safari/15.4",
    timestamp: "2025-05-08T11:20:00Z",
  },
  {
    id: "6",
    userId: "3",
    action: "content_create",
    description: "새 콘텐츠 작성: '글로벌 경제 불확실성 속 투자 전략'",
    ip: "192.168.1.3",
    userAgent: "Safari/15.4",
    timestamp: "2025-05-08T13:10:00Z",
  },
  {
    id: "7",
    userId: "4",
    action: "login",
    description: "로그인 성공",
    ip: "192.168.1.4",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-05-07T16:45:00Z",
  },
  {
    id: "8",
    userId: "4",
    action: "media_upload",
    description: "미디어 업로드: 'marketing-campaign.jpg'",
    ip: "192.168.1.4",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-05-07T17:20:00Z",
  },
  {
    id: "9",
    userId: "6",
    action: "login",
    description: "로그인 성공",
    ip: "192.168.1.6",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-05-06T09:30:00Z",
  },
  {
    id: "10",
    userId: "6",
    action: "settings_change",
    description: "사이트 설정 변경: '캐시 설정 업데이트'",
    ip: "192.168.1.6",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-05-06T10:45:00Z",
  },
  {
    id: "11",
    userId: "8",
    action: "login_failed",
    description: "로그인 실패: 비밀번호 오류",
    ip: "192.168.1.8",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-04-15T14:15:00Z",
  },
  {
    id: "12",
    userId: "8",
    action: "login",
    description: "로그인 성공",
    ip: "192.168.1.8",
    userAgent: "Chrome/98.0.4758.102",
    timestamp: "2025-04-15T14:20:00Z",
  },
  {
    id: "13",
    userId: "8",
    action: "account_suspended",
    description: "계정 정지: 정책 위반",
    ip: "192.168.1.100",
    userAgent: "System",
    timestamp: "2025-04-15T16:30:00Z",
  },
]

// 스켈레톤 로딩 컴포넌트
function UsersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-4 py-3">
            <Skeleton className="h-5 w-5 col-span-1" />
            <Skeleton className="h-5 w-full col-span-7" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-8 gap-4 py-4 border-t">
              <Skeleton className="h-5 w-5 col-span-1" />
              <Skeleton className="h-10 w-full col-span-7" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 상태에 따른 배지 스타일
function getUserStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500">활성</Badge>
    case "inactive":
      return (
        <Badge variant="outline" className="text-gray-500">
          비활성
        </Badge>
      )
    case "pending":
      return <Badge className="bg-yellow-500">대기중</Badge>
    case "suspended":
      return <Badge className="bg-red-500">정지됨</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// 역할에 따른 배지 스타일
function getUserRoleBadge(role: string) {
  switch (role) {
    case "admin":
      return <Badge className="bg-purple-500">관리자</Badge>
    case "editor":
      return <Badge className="bg-blue-500">에디터</Badge>
    case "writer":
      return <Badge className="bg-green-500">작가</Badge>
    case "marketing":
      return <Badge className="bg-orange-500">마케팅</Badge>
    case "designer":
      return <Badge className="bg-pink-500">디자이너</Badge>
    case "developer":
      return <Badge className="bg-gray-700">개발자</Badge>
    default:
      return <Badge variant="outline">{role}</Badge>
  }
}

// 활동 로그 아이콘
function getActivityIcon(action: string) {
  switch (action) {
    case "login":
      return <UserCheck className="h-4 w-4 text-green-500" />
    case "login_failed":
      return <UserX className="h-4 w-4 text-red-500" />
    case "content_create":
    case "content_edit":
      return <FileText className="h-4 w-4 text-blue-500" />
    case "media_upload":
      return <Upload className="h-4 w-4 text-purple-500" />
    case "settings_change":
      return <Settings className="h-4 w-4 text-gray-500" />
    case "account_suspended":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4 text-gray-500" />
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [showAddUserDialog, setShowAddUserDialog] = useState(false)
  const [showUserDetailsDialog, setShowUserDetailsDialog] = useState(false)
  const [selectedUserDetails, setSelectedUserDetails] = useState<typeof MOCK_USERS[0] | null>(null)
  const [userLogs, setUserLogs] = useState(MOCK_USER_LOGS)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "editor",
    sendInvite: true,
  })

  const { toast } = useToast()

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // 필터링된 사용자
  const filteredUsers = users.filter((user) => {
    // 탭 필터
    if (activeTab === "active" && user.status !== "active") return false
    if (activeTab === "inactive" && user.status !== "inactive") return false
    if (activeTab === "pending" && user.status !== "pending") return false
    if (activeTab === "suspended" && user.status !== "suspended") return false

    // 검색어 필터
    if (
      searchTerm &&
      !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // 역할 필터
    if (roleFilter && roleFilter !== "all" && user.role !== roleFilter) {
      return false
    }

    // 상태 필터
    if (statusFilter && statusFilter !== "all" && user.status !== statusFilter) {
      return false
    }

    return true
  })

  // 전체 선택 토글
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  // 개별 선택 토글
  const toggleSelect = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userId) => userId !== id))
    } else {
      setSelectedUsers([...selectedUsers, id])
    }
  }

  // 선택된 항목 삭제
  const deleteSelected = () => {
    if (window.confirm(`선택한 ${selectedUsers.length}명의 사용자를 삭제하시겠습니까?`)) {
      // 실제 구현 시 API 호출로 대체
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)))
      setSelectedUsers([])

      toast({
        title: "삭제 완료",
        description: `${selectedUsers.length}명의 사용자가 삭제되었습니다.`,
      })
    }
  }

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("")
    setRoleFilter(null)
    setStatusFilter(null)
    setActiveTab("all")

    toast({
      title: "필터 초기화",
      description: "모든 필터가 초기화되었습니다.",
    })
  }

  // 사용자 상세 정보 표시
  const showUserDetails = (user: typeof MOCK_USERS[0]) => {
    setSelectedUserDetails(user)
    setShowUserDetailsDialog(true)
  }

  // 사용자 추가
  const handleAddUser = () => {
    // 유효성 검사
    if (!newUser.name.trim()) {
      toast({
        variant: "destructive",
        title: "이름을 입력해주세요",
      })
      return
    }

    if (!newUser.email.trim() || !newUser.email.includes("@")) {
      toast({
        variant: "destructive",
        title: "유효한 이메일을 입력해주세요",
      })
      return
    }

    // 실제 구현 시 API 호출로 대체
    const newUserId = `new-${Date.now()}`
    const createdUser = {
      id: newUserId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "pending",
      lastLogin: null,
      createdAt: new Date().toISOString(),
      avatar: null,
    }

    setUsers([createdUser, ...users])
    
    // 초대 이메일 발송 (실제 구현 시 API 호출로 대체)
    if (newUser.sendInvite) {
      toast({
        title: "초대 이메일 발송됨",
        description: `${newUser.email}로 초대 이메일이 발송되었습니다.`,
      })
    }

    // 폼 초기화 및 다이얼로그 닫기
    setNewUser({
      name: "",
      email: "",
      role: "editor",
      sendInvite: true,
    })
    setShowAddUserDialog(false)

    toast({
      title: "사용자 추가 완료",
      description: `${newUser.name} 사용자가 추가되었습니다.`,
    })
  }

  // 사용자 상태 변경
  const changeUserStatus = (userId: string, newStatus: string) => {
    // 실제 구현 시 API 호출로 대체
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          return { ...user, status: newStatus }
        }
        return user
      })
    )

    toast({
      title: "상태 변경 완료",
      description: `사용자 상태가 ${newStatus}로 변경되었습니다.`,
    })

    // 상세 정보 다이얼로그가 열려있는 경우 정보 업데이트
    if (selectedUserDetails && selectedUserDetails.id === userId) {
      setSelectedUserDetails({ ...selectedUserDetails, status: newStatus })
    }
  }

  // 사용자 활동 로그 필터링
  const filteredUserLogs = selectedUserDetails
    ? userLogs.filter((log) => log.userId === selectedUserDetails.id)
    : []

  if (isLoading) {
    return (
      <AdminLayout>
        <UsersTableSkeleton />
      </AdminLayout>
    )
  }

  // 상태별 카운트
  const statusCounts = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    pending: users.filter((u) => u.status === "pending").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="text-sm text-gray-500">모든 사용자를 관리하고 권한을 설정할 수 있습니다.</p>
        </div>
        <Button
          className="bg-[#FFC83D] hover:bg-[#FFB800] shadow-sm transition-all"
          onClick={() => setShowAddUserDialog(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> 사용자 추가
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                전체 ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                활성 ({statusCounts.active})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                대기중 ({statusCounts.pending})
              </TabsTrigger>
              <TabsTrigger
                value="inactive"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                비활성 ({statusCounts.inactive})
              </TabsTrigger>
              <TabsTrigger
                value="suspended"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                정지됨 ({statusCounts.suspended})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="이름 또는 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={roleFilter || ""} onValueChange={(value) => setRoleFilter(value || null)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="역할" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 역할</SelectItem>
              <SelectItem value="admin">관리자</SelectItem>
              <SelectItem value="editor">에디터</SelectItem>
              <SelectItem value="writer">작가</SelectItem>
              <SelectItem value="marketing">마케팅</SelectItem>
              <SelectItem value="designer">디자이너</SelectItem>
              <SelectItem value="developer">개발자</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
              <SelectItem value="pending">대기중</SelectItem>
              <SelectItem value="suspended">정지됨</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={resetFilters}
            title="필터 초기화"
            className="hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>

      {/* 선택된 항목 액션 */}
      {selectedUsers.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-md flex flex-wrap items-center mb-4 gap-2 border border-amber-200 shadow-sm">
          <span className="text-sm font-medium text-amber-800 mr-4">{selectedUsers.length}명 선택됨</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-8 bg-white">
              <Mail className="mr-1 h-4 w-4" /> 이메일 발송
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-white"
              onClick={() => {
                // 실제 구현 시 API 호출로 대체
                setUsers(
                  users.map((user) => {
                    if (selectedUsers.includes(user.id)) {
                      return { ...user, status: "active" }
                    }
                    return user
                  })
                )
                setSelectedUsers([])
                toast({
                  title: "상태 변경 완료",
                  description: `${selectedUsers.length}명의 사용자 상태가 활성으로 변경되었습니다.`,
                })
              }}
            >
              <CheckCircle className="mr-1 h-4 w-4" /> 활성화
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-white"
              onClick={() => {
                // 실제 구현 시 API 호출로 대체
                setUsers(
                  users.map((user) => {
                    if (selectedUsers.includes(user.id)) {
                      return { ...user, status: "inactive" }
                    }
                    return user
                  })
                )
                setSelectedUsers([])
                toast({
                  title: "상태 변경 완료",
                  description: `${selectedUsers.length}명의 사용자 상태가 비활성으로 변경되었습니다.`,
                })
              }}
            >
              <XCircle className="mr-1 h-4 w-4" /> 비활성화
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteSelected} className="h-8">
              <Trash2 className="mr-1 h-4 w-4" /> 삭제
            </Button>
          </div>
        </div>
      )}

      {/* 사용자 테이블 */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>사용자</TableHead>
              <TableHead className="w-[120px]">역할</TableHead>
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead className="w-[150px]">마지막 로그인</TableHead>
              <TableHead className="w-[150px]">가입일</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-gray-300 mb-2" />
                    <p>검색 결과가 없습니다.</p>
                    <Button variant="link" className="mt-2" onClick={resetFilters}>
                      필터 초기화하기
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group hover:bg-gray-50">
                  <TableCell>
                    <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={() => toggleSelect(user.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback className="bg-gray-200 text-gray-600">
                          {user.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium group-hover:text-[#FFC83D] transition-colors">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getUserRoleBadge(user.role)}</TableCell>
                  <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      format(new Date(user.lastLogin), "yyyy-MM-dd HH:mm")
                    ) : (
                      <span className="text-gray-400">로그인 기록 없음</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), "yyyy-MM-dd")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => showUserDetails(user)}>
                          <Eye className="mr-2 h-4 w-4" /> 상세 정보
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> 편집
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" /> 이메일 발송
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Lock className="mr-2 h-4 w-4" /> 비밀번호 재설정
                        </DropdownMenuItem>
                        {user.status !== "active" && (
                          <DropdownMenuItem onClick={() => changeUserStatus(user.id, "active")}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> 활성화
                          </DropdownMenuItem>
                        )}
                        {user.status !== "inactive" && (
                          <DropdownMenuItem onClick={() => changeUserStatus(user.id, "inactive")}>
                            <XCircle className="mr-2 h-4 w-4 text-gray-500" /> 비활성화
                          </DropdownMenuItem>
                        )}
                        {user.status !== "suspended" && (
                          <DropdownMenuItem onClick={() => changeUserStatus(user.id, "suspended")}>
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" /> 계정 정지
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm("이 사용자를 삭제하시겠습니까?")) {
                              setUsers(users.filter((u) => u.id !== user.id))
                              toast({
                                title: "삭제 완료",
                                description: "사용자가 삭제되었습니다.",
                              })
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 사용자 추가 다이얼로그 */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>새 사용자 추가</DialogTitle>
            <DialogDescription>
              새로운 사용자를 추가하고 권한을 설정합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="사용자 이름"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="역할 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="editor">에디터</SelectItem>
                  <SelectItem value="writer">작가</SelectItem>
                  <SelectItem value="marketing">마케팅</SelectItem>
                  <SelectItem value="designer">디자이너</SelectItem>
                  <SelectItem value="developer">개발자</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="send-invite"
                checked={newUser.sendInvite}
                onCheckedChange={(checked) => setNewUser({ ...newUser, sendInvite: checked })}
              />
              <Label htmlFor="send-invite">초대 이메일 발송</Label>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddUser} className="bg-[#FFC83D] hover:bg-[#FFB800]">
              사용자 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 사용자 상세 정보 다이얼로그 */}
      <Dialog open={showUserDetailsDialog} onOpenChange={setShowUserDetailsDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>사용자 상세 정보</DialogTitle>
          </DialogHeader>
          
          {selectedUserDetails && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-24 w-24 mb-4">
                          <AvatarImage src={selectedUserDetails.avatar || ""} alt={selectedUserDetails.name} />
                          <AvatarFallback className="text-2xl bg-gray-200 text-gray-600">
                            {selectedUserDetails.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{selectedUserDetails.name}</h3>
                        <p className="text-gray-500 mb-2">{selectedUserDetails.email}</p>
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                          {getUserRoleBadge(selectedUserDetails.role)}
                          {getUserStatusBadge(selectedUserDetails.status)}
                        </div>
                        
                        <div className="w-full space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">가입일:</span>
                            <span>{format(new Date(selectedUserDetails.createdAt), "yyyy년 MM월 dd일")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">마지막 로그인:</span>
                            <span>
                              {selectedUserDetails.lastLogin
                                ? format(new Date(selectedUserDetails.lastLogin), "yyyy년 MM월 dd일 HH:mm")
                                : "로그인 기록 없음"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="mt-4 space-y-2">
                    <Button className="w-full bg-[#FFC83D] hover:bg-[#FFB800]">
                      <Edit className="mr-2 h-4 w-4" /> 정보 수정
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" /> 이메일 발송
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Lock className="mr-2 h-4 w-4" /> 비밀번호 재설정
                    </Button>
                    {selectedUserDetails.status !== "active" && (
                      <Button
                        variant="outline"
                        className="w-full text-green-600 hover:bg-green-50"
                        onClick={() => changeUserStatus(selectedUserDetails.id, "active")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> 계정 활성화
                      </Button>
                    )}
                    {selectedUserDetails.status !== "inactive" && (
                      <Button
                        variant="outline"
                        className="w-full text-gray-600 hover:bg-gray-50"
                        onClick={() => changeUserStatus(selectedUserDetails.id, "inactive")}
                      >
                        <XCircle className="mr-2 h-4 w-4" /> 계정 비활성화
                      </Button>
                    )}
                    {selectedUserDetails.status !== "suspended" && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50"
                        onClick={() => changeUserStatus(selectedUserDetails.id, "suspended")}
                      >
                        \
