"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageIcon, Upload, X } from 'lucide-react'

interface ImagePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (altText: string) => void
  imageUrl: string
  fileName: string
}

export function ImagePreviewModal({ 
  open, 
  onOpenChange, 
  onConfirm, 
  imageUrl, 
  fileName 
}: ImagePreviewModalProps) {
  const [altText, setAltText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!altText.trim()) {
      return
    }
    
    setIsSubmitting(true)
    await onConfirm(altText.trim())
    setIsSubmitting(false)
    setAltText('')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setAltText('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImageIcon className="mr-2 h-5 w-5 text-[#FFC83D]" />
            이미지 삽입 미리보기
          </DialogTitle>
          <DialogDescription>
            이미지를 확인하고 대체 텍스트(ALT)를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 이미지 미리보기 */}
          <div className="relative w-full rounded-lg overflow-hidden bg-gray-100">
            <div className="aspect-video">
              <Image
                src={imageUrl}
                alt="업로드된 이미지 미리보기"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* 파일 정보 */}
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Upload className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-700 font-medium">{fileName}</span>
          </div>

          {/* ALT 텍스트 입력 */}
          <div className="space-y-2">
            <Label htmlFor="alt-text" className="flex items-center">
              대체 텍스트 (ALT)
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="이미지에 대한 설명을 입력하세요"
              className={!altText.trim() ? "border-red-300 focus:border-red-500" : ""}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && altText.trim()) {
                  handleConfirm()
                }
              }}
            />
            <div className="space-y-1">
              <p className="text-xs text-gray-600">
                • 이미지가 무엇을 보여주는지 간단히 설명해주세요
              </p>
              <p className="text-xs text-gray-600">
                • 스크린 리더와 검색 엔진에서 사용됩니다
              </p>
              <p className="text-xs text-gray-600">
                • 예: "건강한 샐러드를 만드는 모습", "축구 경기 중인 선수들"
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            <X className="mr-2 h-4 w-4" />
            취소
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!altText.trim() || isSubmitting}
            className="bg-[#FFC83D] hover:bg-[#FFB800] text-black"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                삽입 중...
              </span>
            ) : (
              <>
                <ImageIcon className="mr-2 h-4 w-4" />
                이미지 삽입
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 