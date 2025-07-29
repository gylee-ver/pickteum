import Image from "next/image"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface StaticContentCardProps {
  id: string
  title: string
  category: {
    name: string
    color: string
  }
  thumbnail: string | null
  publishedAt?: string | null
  date: string // 이미 yyyy.MM.dd 형식
}

function getRelativeTime(publishedAt?: string | null, fallbackDate?: string) {
  if (!publishedAt) return fallbackDate

  const now = new Date()
  const published = new Date(publishedAt)
  const diff = (now.getTime() - published.getTime()) / 1000 // 초 단위

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`

  return fallbackDate ?? format(published, 'yyyy.MM.dd', { locale: ko })
}

export default function StaticContentCard({ id, title, category, thumbnail, publishedAt, date }: StaticContentCardProps) {
  const imageUrl = getImageUrl(thumbnail)
  const relative = getRelativeTime(publishedAt, date)

  return (
    <article className="block">
      {/* 자바스크립트가 없어도 링크가 작동해야 하므로 a 태그 */}
      <Link href={`/article/${id}`} className="block hover:opacity-90 transition-opacity">
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
                aria-label={`${category.name} 카테고리`}
              />
              <span className="text-xs text-[#767676] font-medium">{category.name}</span>
              <span className="text-xs text-[#767676]">·</span>
              <time className="text-xs text-[#767676]" dateTime={publishedAt || date}>
                {relative}
              </time>
            </div>
            <h2 className="text-base font-semibold text-[#212121] leading-tight line-clamp-2 hover:text-[#FFC83D] transition-colors">
              {title}
            </h2>
          </div>

          {/* 이미지 – skeleton 없이 바로 렌더 */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              quality={60}
              priority={false}
            />
          </div>
        </div>
      </Link>
    </article>
  )
} 