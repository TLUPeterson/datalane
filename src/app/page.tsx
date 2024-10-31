import { RaceSchedule } from "@/components/raceSchedule"
import { LiveData } from "@/components/liveData"
//import  HistoricalData  from "@/components/historicalData"
import TelemetryDashboard from "@/components/historical/telemetary"
import { Standings } from "@/components/standings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import localFont from 'next/font/local'

const montserratAlt1 = localFont({ src:'./fonts/MontserratAlt1-SemiBold.woff2'})

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffff] text-[#1F1235] font-mono">
      <div className="container mx-auto px-4 py-2 ">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent max-w-[75%] sm:max-w-[25%] mx-auto">
        <div className={`${montserratAlt1.className} bg-clip-text bg-gradient-to-r from-orange-500 to-green-500`}>
          DATALANE
        </div>
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
                <TelemetryDashboard />
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