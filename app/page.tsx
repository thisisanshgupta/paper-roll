import { PaperFeed } from "@/components/paper-feed"
import { ThemeToggle } from "@/components/theme-toggle"
import { FavoritesButton } from "@/components/favorites-button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-md pb-4 pt-2 border-b border-border/40 mb-4">
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold title-text">Paper-Roll</h1>
            <div className="flex items-center gap-3">
              <FavoritesButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="flex-1 w-full">
          <PaperFeed />
        </div>

        <footer className="py-6 text-center text-sm text-muted-foreground">
          Discover cutting-edge research with Paper-Roll
        </footer>
      </div>
    </main>
  )
}
