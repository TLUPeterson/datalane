"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface LiveSessionData {
  session_status: string
  track_status: string
  session_name: string
}

export function LiveData() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<LiveSessionData | null>(null)

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch('/api/live')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch live data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveData()
    const interval = setInterval(fetchLiveData, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full bg-white/5" />
      </div>
    )
  }

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Live Session Data</h2>
      {data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-1">Session</h3>
              <p className="text-lg font-semibold">{data.session_name}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-1">Session Status</h3>
              <p className="text-lg font-semibold">{data.session_status}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h3 className="text-sm text-gray-400 mb-1">Track Status</h3>
              <p className="text-lg font-semibold">{data.track_status}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          No live session currently in progress
        </div>
      )}
    </Card>
  )
}