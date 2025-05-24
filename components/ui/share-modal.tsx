import { X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shortUrl: string
  isGenerating: boolean
  onCopy: () => void
  isCopied: boolean
}

export function ShareModal({ isOpen, onClose, shortUrl, isGenerating, onCopy, isCopied }: ShareModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* 모달 콘텐츠 */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">링크 공유</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
        
        {/* 본문 */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            아래 단축 링크를 복사해서 공유하세요
          </p>
          
          {/* 단축 URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">단축 링크</label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-50 border rounded-lg">
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-[#FFC83D] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-gray-500">생성 중...</span>
                  </div>
                ) : (
                  <span className="text-sm font-mono break-all">{shortUrl}</span>
                )}
              </div>
              <Button
                size="sm"
                onClick={onCopy}
                disabled={isGenerating || !shortUrl}
                className="bg-[#FFC83D] hover:bg-[#FFB800] text-black"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* 푸터 */}
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
} 