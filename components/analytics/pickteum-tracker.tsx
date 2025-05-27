"use client"

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PickteumTrackerProps {
  articleId?: string
  categoryName?: string
  isHomePage?: boolean
}

export default function PickteumTracker({ 
  articleId, 
  categoryName, 
  isHomePage = false 
}: PickteumTrackerProps) {
  const pathname = usePathname()
  const sessionStartRef = useRef<number>(Date.now())
  const pageViewCountRef = useRef<number>(0)
  const engagementLevelRef = useRef<'low' | 'medium' | 'high'>('low')
  const hasTrackedVisitorRef = useRef<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return

    // 🎯 1. 월간 순 방문자 수 추적
    const trackUniqueVisitor = () => {
      if (hasTrackedVisitorRef.current) return
      hasTrackedVisitorRef.current = true

      // 트래픽 소스 상세 분석
      const referrer = document.referrer
      let trafficSource = 'direct'
      let trafficSourceDetail = 'direct_access'

      if (referrer) {
        const referrerHost = new URL(referrer).hostname
        if (referrerHost.includes('google.') || referrerHost.includes('naver.') || 
            referrerHost.includes('daum.') || referrerHost.includes('bing.')) {
          trafficSource = 'organic_search'
          trafficSourceDetail = referrerHost
        } else if (referrerHost.includes('facebook.') || referrerHost.includes('instagram.') || 
                   referrerHost.includes('twitter.') || referrerHost.includes('youtube.')) {
          trafficSource = 'social'
          trafficSourceDetail = referrerHost
        } else {
          trafficSource = 'referral'
          trafficSourceDetail = referrerHost
        }
      }

      // GA4 페이지뷰 이벤트 (수동 전송)
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_referrer: referrer,
        article_id: articleId || 'homepage',
        category_name: categoryName || (isHomePage ? 'homepage' : 'other'),
        traffic_source_detail: trafficSourceDetail,
        content_depth: isHomePage ? 'homepage' : (articleId ? 'article' : 'category')
      })

      // 디버그용 로그
      console.log('GA4 Event Sent:', {
        event: 'page_view',
        article_id: articleId || 'homepage',
        category_name: categoryName || (isHomePage ? 'homepage' : 'other'),
        traffic_source_detail: trafficSourceDetail,
        content_depth: isHomePage ? 'homepage' : (articleId ? 'article' : 'category')
      })

      // 🔥 북극성 지표: 월간 순 방문자 추적
      window.gtag('event', 'monthly_unique_visitor', {
        traffic_source: trafficSource,
        traffic_source_detail: trafficSourceDetail,
        visitor_type: 'unique',
        month: new Date().toISOString().slice(0, 7) // YYYY-MM 형식
      })
    }

    // 🎯 2. 세션당 페이지뷰 추적
    const trackSessionPageview = () => {
      pageViewCountRef.current += 1
      
      window.gtag('event', 'session_pageview', {
        session_page_count: pageViewCountRef.current,
        article_id: articleId || 'homepage',
        category_name: categoryName || 'homepage',
        session_duration: Math.floor((Date.now() - sessionStartRef.current) / 1000)
      })

      // 참여 등급 업데이트
      if (pageViewCountRef.current >= 3) {
        engagementLevelRef.current = 'high'
        window.gtag('event', 'high_engagement_session', {
          session_page_count: pageViewCountRef.current,
          engagement_level: 'high'
        })
      } else if (pageViewCountRef.current >= 2) {
        engagementLevelRef.current = 'medium'
      }
    }

    // 🎯 3. 콘텐츠 참여도 추적 (아티클 페이지에서만)
    const trackContentEngagement = () => {
      if (!articleId) return

      let scrollDepth = 0
      let timeOnPage = 0
      let isActive = true
      let lastActiveTime = Date.now()

      const updateScrollDepth = () => {
        const scrollTop = window.pageYOffset
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const currentScrollDepth = Math.round((scrollTop / docHeight) * 100)
        
        if (currentScrollDepth > scrollDepth) {
          scrollDepth = currentScrollDepth
          
          // 스크롤 깊이별 이벤트
          if (scrollDepth >= 25 && scrollDepth < 50) {
            window.gtag('event', 'scroll_depth_25', {
              article_id: articleId,
              category_name: categoryName,
              scroll_depth: scrollDepth
            })
          } else if (scrollDepth >= 50 && scrollDepth < 75) {
            window.gtag('event', 'scroll_depth_50', {
              article_id: articleId,
              category_name: categoryName,
              scroll_depth: scrollDepth
            })
          } else if (scrollDepth >= 75) {
            window.gtag('event', 'scroll_depth_75', {
              article_id: articleId,
              category_name: categoryName,
              scroll_depth: scrollDepth
            })
            
            // 75% 이상 스크롤은 고품질 참여로 간주
            window.gtag('event', 'high_quality_engagement', {
              article_id: articleId,
              category_name: categoryName,
              engagement_type: 'deep_read',
              scroll_depth: scrollDepth
            })
          }
        }
      }

      // 체류 시간 추적
      const timeTracker = setInterval(() => {
        if (isActive) {
          timeOnPage += 10
          
          // 시간 마일스톤 이벤트
          if (timeOnPage === 30) {
            window.gtag('event', 'time_on_page_30s', {
              article_id: articleId,
              category_name: categoryName,
              time_on_page: timeOnPage
            })
          } else if (timeOnPage === 60) {
            window.gtag('event', 'time_on_page_60s', {
              article_id: articleId,
              category_name: categoryName,
              time_on_page: timeOnPage
            })
          } else if (timeOnPage === 120) {
            window.gtag('event', 'time_on_page_120s', {
              article_id: articleId,
              category_name: categoryName,
              time_on_page: timeOnPage
            })
            
            // 2분 이상 체류는 고품질 참여
            window.gtag('event', 'high_quality_engagement', {
              article_id: articleId,
              category_name: categoryName,
              engagement_type: 'long_read',
              time_on_page: timeOnPage
            })
          }
        }
      }, 10000) // 10초마다 체크

      // 사용자 활동 감지
      const updateActivity = () => {
        isActive = true
        lastActiveTime = Date.now()
      }

      const checkInactivity = () => {
        if (Date.now() - lastActiveTime > 30000) { // 30초 이상 비활성
          isActive = false
        }
      }

      // 이벤트 리스너 등록
      const events = ['scroll', 'mousemove', 'keydown', 'click', 'touchstart']
      events.forEach(event => {
        if (event === 'scroll') {
          document.addEventListener(event, () => {
            updateActivity()
            updateScrollDepth()
          }, { passive: true })
        } else {
          document.addEventListener(event, updateActivity, { passive: true })
        }
      })

      // 비활성 상태 체크 (10초마다)
      const inactivityInterval = setInterval(checkInactivity, 10000)

      // 페이지 이탈 시 최종 데이터 전송
      const handleBeforeUnload = () => {
        if (timeOnPage > 5) { // 5초 이상 체류한 경우만
          window.gtag('event', 'page_exit', {
            article_id: articleId,
            category_name: categoryName,
            final_time_on_page: timeOnPage,
            final_scroll_depth: scrollDepth,
            engagement_level: engagementLevelRef.current
          })
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      // 클린업 함수
      return () => {
        clearInterval(timeTracker)
        clearInterval(inactivityInterval)
        events.forEach(event => {
          document.removeEventListener(event, updateActivity)
        })
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }

    // 초기 추적 실행
    trackUniqueVisitor()
    trackSessionPageview()
    const cleanupContentTracking = trackContentEngagement()

    return cleanupContentTracking
  }, [pathname, articleId, categoryName, isHomePage])

  return null // UI 없는 추적 컴포넌트
} 