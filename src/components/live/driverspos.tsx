"use client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDataFetching } from "@/hooks/liveDataFetch"

interface DriverPosition {
  date: string
  driver_number: number
  meeting_key: number
  position: number
  session_key: number
}

// Map of driver numbers to names
const driversMap: { [key: number]: string } = {
  1: "Max Verstappen",
  2: "Logan Sargeant",
  3: "Daniel Ricciardo",
  4: "Lando Norris",
  10: "Pierre Gasly",
  11: "Sergio Pérez",
  14: "Fernando Alonso",
  16: "Charles Leclerc",
  18: "Lance Stroll",
  20: "Kevin Magnussen",
  22: "Yuki Tsunoda",
  23: "Alexander Albon",
  24: "Zhou Guanyu",
  27: "Nico Hülkenberg",
  30: "Liam Lawson",
  31: "Esteban Ocon",
  43: "Franco Colapinto",
  44: "Lewis Hamilton",
  55: "Carlos Sainz Jr.",
  63: "George Russell",
  77: "Valtteri Bottas",
  81: "Oscar Piastri"
}

// Helper function to get latest position for each driver
const getLatestPositions = (data: DriverPosition[]) => {
  const positionMap = new Map<number, DriverPosition>()

  // Sort by date first to ensure we get the latest position
  const sortedData = [...data].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Keep only the latest position for each driver
  sortedData.forEach(entry => {
    if (!positionMap.has(entry.driver_number)) {
      positionMap.set(entry.driver_number, entry)
    }
  })

  // Convert map back to array and sort by position
  return Array.from(positionMap.values())
    .sort((a, b) => a.position - b.position)
}

export function DriverPositionsComponent() {
  const { data: positionsData, loading } = useDataFetching<DriverPosition[]>({
    url: 'https://api.openf1.org/v1/position?session_key=latest',
    cacheKey: 'positions',
    cacheDuration: 10000, // 10 seconds cache
    pollInterval: 10000, // 10 seconds polling
    transformData: getLatestPositions
  })

  if (loading) return <Skeleton className="h-[400px] w-full bg-red/5" />

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Current Positions</h2>
      {positionsData && positionsData.length > 0 ? (
        <div className="space-y-4">
          {positionsData.map((driver) => (
            <div 
              key={driver.driver_number}
              className="p-4 bg-white/5 rounded-lg flex items-center justify-between"
            >
              <span className="text-2xl font-bold text-gray-400">
                P{driver.position}
              </span>
              <div className="text-lg font-semibold">
                #{driver.driver_number} - {driversMap[driver.driver_number] || "Unknown Driver"}
              </div>
              <span className="text-sm text-gray-400">
                {new Date(driver.date).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>No position data available</p>
      )}
    </Card>
  )
}
