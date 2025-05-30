"use client"

import Image from "next/image"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils"
import { useState } from "react"

interface ContentCardProps {
  id: string
  title: string
  category: {
    name: string
    color: string
  }
  thumbnail: string
  date: string
}

export default function ContentCard({ id, title, category, thumbnail, date }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const processedUrl = getImageUrl(thumbnail)
  
  return (
    <Link href={`/article/${id}`}>
      <div className="w-full py-3 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-lg">
        <div className="flex items-start gap-3 mb-2">
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
          <span className="text-xs text-[#767676] ml-auto">{date}</span>
        </div>

        <h3 className="text-base font-semibold text-[#212121] line-clamp-2 mb-2">{title}</h3>

        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          {/* 로딩 스켈레톤 */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded"></div>
            </div>
          )}
          
          {!imageError ? (
            <Image
              src={processedUrl}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={75}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.error('이미지 로드 실패:', processedUrl)
                setImageError(true)
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-sm">이미지 없음</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
