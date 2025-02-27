'use client'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"
import Sidebar from '@/components/Sidebar'
import TimeSlider from '@/components/TimeSlider'
import { useSidebarStats } from '@/hooks/useSidebarStats'
import { useIncidents } from '@/hooks/useIncidents'
import { useIsMobile } from '@/components/ui/use-mobile'

const Map = dynamic(() => import('@/components/Map'), {
  loading: () => <Skeleton className="h-[calc(100vh-8rem)] w-full" />,
  ssr: false
})

const MapComponent = () => {
  const isMobile = useIsMobile()

  if (isMobile) {
    return null;
  }

  return (
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <Map />
    </Suspense>
  )
}

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <div className="hidden md:flex flex-1 flex-col p-4 h-screen overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">Chicago Incident Reports (2018-2023)</h1>
        <div className="relative flex-1 mb-4">
          <MapComponent />
        </div>
        <div className="w-full px-4 pb-4">
          <TimeSlider startDate="2018-01-01" endDate="2023-12-31" />
        </div>
      </div>
    </main>
  )
}
