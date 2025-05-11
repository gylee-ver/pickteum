import Header from "@/components/header"
import ContentFeed from "@/components/content-feed"
import CategoryFilter from "@/components/category-filter"
import Footer from "@/components/footer"
import { CategoryProvider } from "@/contexts/category-context"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <Header />
        <CategoryProvider>
          <main className="flex-grow px-4">
            <CategoryFilter />
            <ContentFeed />
          </main>
        </CategoryProvider>
        <Footer />
      </div>
    </div>
  )
}
