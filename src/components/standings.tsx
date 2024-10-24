"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Driver {
  position: number
  points: number
  wins: number
  driver: string
  constructor: string
}

interface Constructor {
  position: number
  points: number
  wins: number
  name: string
}

export function Standings() {
  const [driverStandings, setDriverStandings] = useState<Driver[]>([])
  const [constructorStandings, setConstructorStandings] = useState<Constructor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated data - replace with actual API call
    setDriverStandings([
      { position: 1, points: 51, wins: 2, driver: "Max Verstappen", constructor: "Red Bull Racing" },
      { position: 2, points: 47, wins: 0, driver: "Charles Leclerc", constructor: "Ferrari" },
      { position: 3, points: 38, wins: 0, driver: "Carlos Sainz", constructor: "Ferrari" },
    ])
    
    setConstructorStandings([
      { position: 1, points: 87, wins: 2, name: "Red Bull Racing" },
      { position: 2, points: 85, wins: 0, name: "Ferrari" },
      { position: 3, points: 56, wins: 0, name: "Mercedes" },
    ])
    
    setLoading(false)
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
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e10600] text-white font-bold">
                    {driver.position}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{driver.driver}</h3>
                    <p className="text-sm text-gray-400">{driver.constructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{driver.points} pts</p>
                    <p className="text-sm text-gray-400">{driver.wins} wins</p>
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
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold">
                    {constructor.position}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{constructor.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{constructor.points} pts</p>
                    <p className="text-sm text-gray-400">{constructor.wins} wins</p>
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