export default function TestShortPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>단축 URL 테스트</h1>
      <p>이 페이지가 보인다면 라우팅은 정상 작동합니다.</p>
      <ul>
        <li><a href="/s/test123">테스트 링크 1</a></li>
        <li><a href="/test-short">현재 페이지 새로고침</a></li>
      </ul>
    </div>
  )
} 