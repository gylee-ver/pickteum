import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageAltTipsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageAltTipsModal({ open, onOpenChange }: ImageAltTipsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#FFC83D]" />
            이미지 alt 텍스트 작성 팁
          </DialogTitle>
          <DialogDescription>
            검색 엔진 최적화(SEO)와 웹 접근성을 위한 이미지 설명 작성 가이드
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">alt 텍스트가 필요한 이유</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>시각 장애인의 스크린 리더가 이미지를 설명할 수 있습니다.</li>
              <li>이미지 로드 실패 시 대체 텍스트로 표시됩니다.</li>
              <li>검색 엔진이 이미지의 내용을 이해하고 검색 결과에 반영합니다.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">작성 팁</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
              <li>이미지의 핵심 내용을 간단명료하게 설명하세요.</li>
              <li>주요 키워드를 자연스럽게 포함시키세요.</li>
              <li>불필요한 "이미지", "사진" 등의 단어는 제외하세요.</li>
              <li>장식용 이미지는 빈 alt=""를 사용하세요.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-2">예시</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>❌ "이미지1.jpg" (파일명을 그대로 사용)</p>
              <p>❌ "사진" (너무 모호한 설명)</p>
              <p>✅ "2024 월드컵 결승전 우승 순간"</p>
              <p>✅ "신형 아이폰 15 프로 티타늄 그레이 측면"</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 