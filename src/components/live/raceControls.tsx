"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [loading, setLoading] = useState(true)
  const [raceControlData, setRaceControlData] = useState<RaceControlData[]>([])

  useEffect(() => {
    const fetchRaceControlData = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/race_control?session_key=latest`)
        if (!response.ok) throw new Error("Failed to fetch race control data")
        const result = await response.json()
        setRaceControlData(result.slice(-5)) // Adjust to display latest 5 entries
      } catch (error) {
        console.error("Error fetching race control data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRaceControlData()
    const interval = setInterval(fetchRaceControlData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <Skeleton className="h-[400px] w-full bg-white/5" />

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Race Control Updates</h2>
      {raceControlData.length > 0 ? (
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
