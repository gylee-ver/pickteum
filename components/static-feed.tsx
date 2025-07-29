import StaticContentCard from "@/components/static-content-card"

interface Article {
  id: string
  title: string
  category: {
    name: string
    color: string
  }
  thumbnail: string | null
  date: string
  publishedAt?: string | null
}

export default function StaticFeed({ articles }: { articles: Article[] }) {
  if (!articles || articles.length === 0) return null
  return (
    <div id="static-feed" className="space-y-6 py-2">
      {articles.map((article) => (
        <StaticContentCard key={article.id} {...article} />
      ))}
    </div>
  )
} 