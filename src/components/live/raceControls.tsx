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
    transformData: (data) => data.reverse()// Newest at top
  })
  // Change message color if text contains one
  const getMessageStyle = (message: string) => {
    if (message.toLowerCase().includes("red")) return "text-red-500"
    if (message.toLowerCase().includes("blue")) return "text-blue-500"
    if (message.toLowerCase().includes("yellow")) return "text-yellow-500"
    if (message.toLowerCase().includes("green")) return "text-green-500"
    if (message.toLowerCase().includes("safety car")) return "text-red-500"
    if (message.toLowerCase().includes("penalty")) return "text-[#f97316]"
    if (message.toLowerCase().includes("investigation")) return "text-[#06b6d4]"
    return "text-black" 
  }

  if (loading) return <Skeleton className="h-[400px] w-full bg-[#FF9B99]/50"/>

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Race Control Updates</h2>
      {raceControlData ? (
        raceControlData.map((entry, index) => (
          <div key={index} className="mb-4">
            <p><strong>Category:</strong> {entry.category}</p>
            <p className={getMessageStyle(entry.message)}><strong>Message:</strong> {entry.message}</p>
            <p><strong>Time:</strong> {new Date(entry.date).toLocaleTimeString()}</p>
          </div>
        ))
      ) : (
        <p>No recent race control updates</p>
      )}
    </Card>
  )
}
