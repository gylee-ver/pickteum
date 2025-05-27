// GA4 이벤트 타입 정의
export interface GAEvent {
  event_name: string
  article_id?: string
  category_name?: string
  traffic_source_detail?: string
  content_depth?: string
  engagement_level?: 'low' | 'medium' | 'high'
  session_page_count?: number
  scroll_depth?: number
  time_on_page?: number
}

// 글로벌 gtag 함수 타입 정의
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: any
    ) => void
    dataLayer: any[]
  }
} 