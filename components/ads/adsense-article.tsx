'use client'

import AdSenseBanner from './adsense-banner'

interface AdSenseArticleProps {
  className?: string
}

export default function AdSenseArticle({ className }: AdSenseArticleProps) {
  return (
    <div className={`my-6 flex justify-center ${className}`}>
      <div className="w-full max-w-[320px] text-center">
        <p className="text-xs text-gray-400 mb-2">광고</p>
        <AdSenseBanner
          adSlot="YOUR_AD_SLOT_ID" // 실제 광고 슬롯 ID로 교체 필요
          adFormat="rectangle"
          className="border border-gray-200 rounded-lg overflow-hidden"
        />
      </div>
    </div>
  )
} 