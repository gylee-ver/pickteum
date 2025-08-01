#!/usr/bin/env node

/**
 * 헤더 검증 스크립트
 * - 배포된 사이트의 헤더를 curl로 검증
 * - AdSense 호환성 및 SEO 최적화 헤더 체크
 */

const { execSync } = require('child_process')
const { validateHeaders } = require('../lib/headers')

// 검증할 URL 목록
const URLS_TO_CHECK = [
  'https://www.pickteum.com',
  'https://www.pickteum.com/category/건강',
  'https://www.pickteum.com/api/articles',
  'https://www.pickteum.com/robots.txt'
]

// 환경 설정
const DOMAIN = process.env.DOMAIN || 'www.pickteum.com'
const PROTOCOL = process.env.PROTOCOL || 'https'

/**
 * curl을 사용하여 헤더 정보 가져오기
 */
function getHeaders(url) {
  try {
    console.log(`🔍 Checking headers for: ${url}`)
    
    const curlCommand = `curl -I -s -L "${url}" | grep -E "^[A-Za-z-]+:" | head -20`
    const output = execSync(curlCommand, { encoding: 'utf8' })
    
    const headers = {}
    output.split('\n').forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/)
      if (match) {
        headers[match[1].trim()] = match[2].trim()
      }
    })
    
    return headers
  } catch (error) {
    console.error(`❌ Error fetching headers for ${url}:`, error.message)
    return {}
  }
}

/**
 * 필수 헤더 검증
 */
function checkRequiredHeaders(headers, url) {
  const errors = []
  
  // AdSense 호환성 체크
  const requiredForAdsense = {
    'X-Frame-Options': 'ALLOWALL',
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none'
  }
  
  Object.entries(requiredForAdsense).forEach(([header, expectedValue]) => {
    if (!headers[header]) {
      errors.push(`❌ Missing AdSense header: ${header}`)
    } else if (headers[header] !== expectedValue) {
      errors.push(`⚠️  AdSense header mismatch: ${header} = "${headers[header]}" (expected: "${expectedValue}")`)
    }
  })
  
  // 기본 보안 헤더 체크
  const requiredSecurity = [
    'X-Content-Type-Options',
    'Referrer-Policy'
  ]
  
  requiredSecurity.forEach(header => {
    if (!headers[header]) {
      errors.push(`❌ Missing security header: ${header}`)
    }
  })
  
  // SEO 헤더 체크
  if (url.includes('/api/')) {
    if (!headers['Cache-Control']) {
      errors.push(`❌ Missing Cache-Control header for API endpoint`)
    }
  } else {
    if (!headers['X-Robots-Tag']) {
      errors.push(`⚠️  Missing SEO header: X-Robots-Tag`)
    }
  }
  
  return errors
}

/**
 * 성능 헤더 검증
 */
function checkPerformanceHeaders(headers, url) {
  const warnings = []
  
  if (!headers['Cache-Control']) {
    warnings.push(`⚠️  No caching strategy found`)
  }
  
  if (!headers['Vary']) {
    warnings.push(`⚠️  Missing Vary header for better caching`)
  }
  
  // 정적 리소스 체크
  if (url.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    if (!headers['Cache-Control']?.includes('max-age')) {
      warnings.push(`⚠️  Static resource should have long-term caching`)
    }
  }
  
  return warnings
}

/**
 * 메인 검증 함수
 */
function verifyHeaders() {
  console.log('🚀 Starting header verification...\n')
  
  let totalErrors = 0
  let totalWarnings = 0
  
  URLS_TO_CHECK.forEach(url => {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📍 URL: ${url}`)
    console.log(`${'='.repeat(80)}`)
    
    const headers = getHeaders(url)
    
    if (Object.keys(headers).length === 0) {
      console.log('❌ Failed to fetch headers\n')
      totalErrors++
      return
    }
    
    // 헤더 목록 출력
    console.log('\n📋 Response Headers:')
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
    
    // 검증 실행
    const errors = checkRequiredHeaders(headers, url)
    const warnings = checkPerformanceHeaders(headers, url)
    
    // 결과 출력
    console.log('\n🔍 Verification Results:')
    
    if (errors.length === 0) {
      console.log('✅ All required headers are present and correct')
    } else {
      errors.forEach(error => console.log(`   ${error}`))
      totalErrors += errors.length
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Performance Recommendations:')
      warnings.forEach(warning => console.log(`   ${warning}`))
      totalWarnings += warnings.length
    }
  })
  
  // 최종 결과
  console.log('\n' + '='.repeat(80))
  console.log('📊 FINAL RESULTS')
  console.log('='.repeat(80))
  
  if (totalErrors === 0) {
    console.log('✅ All header verifications passed!')
    console.log('🎉 Your site is properly configured for AdSense and SEO')
  } else {
    console.log(`❌ Found ${totalErrors} error(s) that need to be fixed`)
  }
  
  if (totalWarnings > 0) {
    console.log(`⚠️  Found ${totalWarnings} optimization opportunity(ies)`)
  }
  
  console.log('\n📚 AdSense & SEO Benefits:')
  console.log('  - X-Frame-Options: ALLOWALL → Allows AdSense iframe embedding')
  console.log('  - COOP/COEP: unsafe-none → Prevents AdSense display issues')
  console.log('  - Cache-Control headers → Improves page load speed (SEO ranking factor)')
  console.log('  - X-Robots-Tag → Guides search engine crawling and indexing')
  console.log('  - Proper caching → Reduces server load and improves user experience')
  
  // CI에서 실행 시 exit code 설정
  if (process.env.CI && totalErrors > 0) {
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  verifyHeaders()
}

module.exports = { verifyHeaders, getHeaders, checkRequiredHeaders }