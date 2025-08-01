"use client"

import Image from "next/image"
import Link from "next/link"
import { getImageUrl, generateBlurDataURL } from "@/lib/utils"
import { useState } from "react"

interface ContentCardProps {
  id: string
  title: string
  category: {
    name: string
    color: string
  }
  thumbnail: string | null
  date: string
  publishedAt?: string
  priority?: boolean
}

function getRelativeTime(publishedAt: string, fallbackDate: string): string {
  const now = new Date()
  const published = new Date(publishedAt)
  const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '방금 전'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}분 전`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}시간 전`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}일 전`
  } else {
    return fallbackDate
  }
}

export default function ContentCard({ id, title, category, thumbnail, date, publishedAt, priority = false }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const processedUrl = getImageUrl(thumbnail)
  const blurDataURL = generateBlurDataURL(thumbnail)
  
  const relativeTime = publishedAt ? getRelativeTime(publishedAt, date) : null
  
  return (
    <article className="block">
      <Link href={`/article/${id}`} className="block hover:opacity-90 transition-opacity">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
                aria-label={`${category.name} 카테고리`}
              />
              <span className="text-xs text-[#767676] font-medium">
                {category.name}
              </span>
              <span className="text-xs text-[#767676]">·</span>
              <time className="text-xs text-[#767676]" dateTime={publishedAt || date}>
                {date}
              </time>
              {relativeTime && relativeTime !== date && (
                <>
                  <span className="text-xs text-[#767676]">·</span>
                  <span className="text-xs text-[#999999] font-normal">
                    {relativeTime}
                  </span>
                </>
              )}
            </div>
            
            <h2 className="text-base font-semibold text-[#212121] leading-tight line-clamp-2 hover:text-[#FFC83D] transition-colors">
              {title}
            </h2>
          </div>

          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            )}
            
            {!imageError ? (
              <Image
                src={processedUrl}
                alt={title}
                width={480}
                height={270}
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                quality={75}
                loading={priority ? "eager" : "lazy"}
                priority={priority}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  console.error('이미지 로드 실패:', processedUrl)
                  setImageError(true)
                }}
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-gray-400 text-sm">이미지 없음</div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
