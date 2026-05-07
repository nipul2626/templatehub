import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TemplateHub — Production-ready React & Supabase templates',
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground">
          Ship faster with
          <br />
          <span className="text-primary">production-ready templates</span>
        </h1>
        <p className="mb-10 max-w-2xl text-xl text-muted-foreground">
          Buy and sell battle-tested React, Next.js, Supabase, and TypeScript templates.
          Every template is AI-reviewed, typed, and ready to deploy.
        </p>
        <div className="flex gap-4">
          <a
            href="/browse"
            className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse templates
          </a>
          <a
            href="/sell"
            className="rounded-lg border border-border px-6 py-3 font-medium hover:bg-muted"
          >
            Start selling
          </a>
        </div>
      </section>
    </main>
  )
}
