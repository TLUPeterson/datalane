"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Driver {
  lastRacePoints: number
  position: number
  points: number
  driver: string
  constructor: string
}

interface Constructor {
  lastRacePoints: number
  position: number
  points: number
  name: string
}

const teamColors: Record<string, string> = {
  "Red Bull": "bg-[#223067]",
  "McLaren": "bg-[#ff9e1b]",
  "Mercedes": "bg-[#00a19c]",
  "Alpine F1 Team": "bg-[#d57ba6]",
  "Ferrari": "bg-[#f5170a]",
  "Aston Martin": "bg-[#008071]",
  "Haas F1 Team": "bg-[#afafaf]",
  "RB F1 Team": "bg-[#4733d9]",
  "Williams": "bg-[#0000ff]",
  "Sauber": "bg-[#09d708]",
}

export function Standings() {
  const [driverStandings, setDriverStandings] = useState<Driver[]>([])
  const [constructorStandings, setConstructorStandings] = useState<Constructor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await fetch('/api/standings')
        if (!response.ok) throw new Error('Failed to fetch standings data')
        const data = await response.json()
        setDriverStandings(data.drivers)
        setConstructorStandings(data.constructors)
      } catch (error) {
        console.error('Failed to fetch standings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [])

  if (loading) {
    return <div>Loading standings...</div>
  }

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="constructors">Constructors</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {driverStandings.map((driver) => (
                <div
                  key={driver.driver}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                      teamColors[driver.constructor] || "bg-white-500"
                    }`}
                  >
                    {driver.position}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{driver.driver}</h3>
                    <p className="text-sm text-gray-400">{driver.constructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{driver.points} pts</p>
                    <p className="text-sm text-[#68A691]">{driver.lastRacePoints} points</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="constructors">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {constructorStandings.map((constructor) => (
                <div
                  key={constructor.name}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                      teamColors[constructor.name] || "bg-white-500"
                    }
                    `}>
                    {constructor.position}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{constructor.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{constructor.points} pts</p>
                    <p className="text-sm text-[#68A691]">{constructor.lastRacePoints} points</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}