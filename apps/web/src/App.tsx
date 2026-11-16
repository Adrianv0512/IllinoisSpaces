import { useEffect, useState } from 'react'

export default function App() {
  const [apiStatus, setApiStatus] = useState('Checking API…')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable')
        return response.json() as Promise<{ status: string }>
      })
      .then((data) => setApiStatus(data.status === 'ok' ? 'API connected' : 'API unavailable'))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return
        setApiStatus('API unavailable')
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="grid size-10 place-items-center rounded-xl bg-emerald-900 text-xl font-bold text-white">I</div>
            <span className="text-lg font-semibold tracking-tight">Illinois Spaces</span>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-900" role="status">
            {apiStatus}
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">Campus study spaces</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">Find a place that works for you.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Explore UIUC study spots by noise, outlets, seating, and Wi-Fi. Read student reviews before choosing where to settle in.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Discover', 'Browse campus study locations on a map and in a list.'],
              ['Compare', 'Filter places by the details that matter to your study session.'],
              ['Share', 'Rate and review spots to help other students.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <footer className="text-sm text-slate-500">Built for the UIUC community.</footer>
      </div>
    </main>
  )
}
