import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle } from "lucide-react"

interface SaveConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'saved' | 'publish-confirm'
  onConfirm?: () => void
  onCancel?: () => void
}

export function SaveConfirmModal({ 
  open, 
  onOpenChange, 
  type, 
  onConfirm, 
  onCancel 
}: SaveConfirmModalProps) {
  if (type === 'saved') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              저장 완료
            </DialogTitle>
            <DialogDescription>
              초안으로 저장되었습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="text-sm text-gray-600">
            <p>아티클이 초안으로 저장되었습니다. 언제든지 수정하거나 발행할 수 있습니다.</p>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#FFC83D]" />
            발행 확인
          </DialogTitle>
          <DialogDescription>
            초안으로 저장된 아티클입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-gray-600">
          <p>발행하시겠습니까?</p>
          <p className="mt-2 text-xs text-gray-500">
            발행 시, 기존 초안 아티클은 발행된 아티클로 업데이트됩니다.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.()
              onOpenChange(false)
            }}
          >
            취소
          </Button>
          <Button
            onClick={() => {
              onConfirm?.()
              onOpenChange(false)
            }}
            className="bg-[#FFC83D] hover:bg-[#FFB800]"
          >
            발행하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 