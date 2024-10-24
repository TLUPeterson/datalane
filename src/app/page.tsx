import { RaceSchedule } from "@/components/raceSchedule"
import { LiveData } from "@/components/liveData"
import { HistoricalData } from "@/components/historicalData"
import { Standings } from "@/components/standings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffff] text-[#1F1235] font-mono">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Datalane
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="calendar">Race Calendar</TabsTrigger>
                <TabsTrigger value="live">Live Data</TabsTrigger>
                <TabsTrigger value="historical">Historical Data</TabsTrigger>
              </TabsList>

              <TabsContent value="calendar">
                <RaceSchedule />
              </TabsContent>

              <TabsContent value="live">
                <LiveData />
              </TabsContent>

              <TabsContent value="historical">
                <HistoricalData />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Standings />
          </div>
        </div>
      </div>
    </main>
  )
}