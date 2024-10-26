"use client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDataFetching } from "@/hooks/liveDataFetch"

export interface RaceControlData {
  category: string
  date: string
  message: string
  driver_number?: number
  flag?: string
  lap_number?: number
  sector?: string
  session_key: number
}

export function RaceControlDataComponent() {
  const { data: raceControlData, loading } = useDataFetching<RaceControlData[]>({
    url: 'https://api.openf1.org/v1/race_control?session_key=latest',
    cacheKey: 'racecontrol',
    cacheDuration: 10000, // caching for 10 seconds
    pollInterval: 10000, // poll every 10 seconds
    transformData: (data) => data.slice(-5) // Get 5 latest entries
  })

  if (loading) return <Skeleton className="h-[400px] w-full bg-red/20" />

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Race Control Updates</h2>
      {raceControlData ? (
        raceControlData.map((entry, index) => (
          <div key={index} className="mb-4">
            <p><strong>Category:</strong> {entry.category}</p>
            <p><strong>Message:</strong> {entry.message}</p>
            <p><strong>Time:</strong> {new Date(entry.date).toLocaleTimeString()}</p>
          </div>
        ))
      ) : (
        <p>No recent race control updates</p>
      )}
    </Card>
  )
}
