import { lazy, Suspense } from 'react'
import { Hero } from './components/Hero'
import { Dock } from './components/Dock'

const Below = lazy(() => import('./components/Below'))

export default function App() {
  return (
    <>
      <main>
        <Hero />
        <Suspense fallback={<div className="min-h-[100svh] bg-fundacao" />}>
          <Below />
        </Suspense>
      </main>
      <Dock />
      <div className="grain" aria-hidden />
    </>
  )
}
