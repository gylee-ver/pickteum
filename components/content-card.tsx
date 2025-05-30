import Image from "next/image"
import Link from "next/link"
import { getImageUrl } from "@/lib/utils"

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

        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <img 
            src={processedUrl} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('이미지 로드 실패:', processedUrl)
              e.currentTarget.src = '/placeholder.svg'
            }}
            onLoad={() => {
              console.log('이미지 로드 성공:', processedUrl)
            }}
          />
        </div>
      </div>
    </Link>
  )
}
