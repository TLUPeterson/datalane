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
};

export function Standings() {
  const [driverStandings, setDriverStandings] = useState<Driver[]>([])
  const [constructorStandings, setConstructorStandings] = useState<Constructor[]>([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    const fetchDriverStandings = async () => {
      try {
        const response = await fetch(`http://ergast.com/api/f1/current/driverStandings`)
        if (!response.ok) throw new Error('Failed to fetch standings data')
        const xmlText = await response.text()
        
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "text/xml")
        
        const drivers = Array.from(xmlDoc.getElementsByTagName("DriverStanding")).map(driverNode => ({
          position: parseInt(driverNode.getAttribute("position") || "0"),
          points: parseInt(driverNode.getAttribute("points") || "0"),
          lastRacePoints: 0,
          driver: driverNode.getElementsByTagName("Driver")[0].getElementsByTagName("FamilyName")[0].textContent || "",
          constructor: driverNode.getElementsByTagName("Constructor")[0].getElementsByTagName("Name")[0].textContent || ""
        }))

        setDriverStandings(drivers)
      } catch (error) {
        console.error('Failed to fetch standings data:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchConstructorStandings = async () => {
      try {
        const response = await fetch('http://ergast.com/api/f1/current/constructorStandings')
        if (!response.ok) throw new Error('Failed to fetch constructor standings')
        const xmlText = await response.text()
  
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml')
        const constructors = Array.from(xmlDoc.getElementsByTagName('ConstructorStanding')).map(node => ({
          position: parseInt(node.getAttribute('position') || '0'),
          points: parseInt(node.getAttribute('points') || '0'),
          lastRacePoints: 0,
          name: node.getElementsByTagName('Name')[0].textContent || ''
        }))
  
        setConstructorStandings(constructors)
      } catch (error) {
        console.error('Failed to fetch constructor standings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    const fetchLastRaceResults = async () => {
      try {
        const response = await fetch('http://ergast.com/api/f1/current/last/results')
        if (!response.ok) throw new Error('Failed to fetch last race results')
        const xmlText = await response.text()
        
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, "text/xml")
        
        const results = Array.from(xmlDoc.getElementsByTagName("Result")).map(resultNode => ({
          driver: resultNode.getElementsByTagName("Driver")[0].getElementsByTagName("FamilyName")[0].textContent || "",
          points: parseInt(resultNode.getAttribute("points") || "0"),
          constructor: resultNode.getElementsByTagName("Constructor")[0].getElementsByTagName("Name")[0].textContent || ""
        }))

        setDriverStandings((prevStandings) =>
          prevStandings.map(driver => {
            const lastRaceResult = results.find(result => result.driver === driver.driver)
            return {
              ...driver,
              lastRacePoints: lastRaceResult ? lastRaceResult.points : 0,
            }
          })
        )

        setConstructorStandings((prevStandings) =>
          prevStandings.map(constructor => {
            const totalPoints = results
              .filter(result => result.constructor === constructor.name)
              .reduce((sum, result) => sum + result.points, 0)
            return {
              ...constructor,
              lastRacePoints: totalPoints,
            }
          })
        )
      } catch (error) {
        console.error('Failed to fetch last race results:', error)
      }
    }

    fetchDriverStandings()
    fetchConstructorStandings()
    fetchLastRaceResults()
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