"use client"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wind, Thermometer, Droplets, Gauge } from "lucide-react"
import { useDataFetching } from "@/hooks/liveDataFetch"

export interface WeatherData {
  air_temperature: number
  date: string
  humidity: number
  meeting_key: number
  pressure: number
  rainfall: number
  session_key: number
  track_temperature: number
  wind_direction: number
  wind_speed: number
}


export function WeatherDataComponent() {
  const { data: weatherData, loading } = useDataFetching<WeatherData>({
    url: 'https://api.openf1.org/v1/weather?session_key=latest',
    cacheKey: 'weather',
    cacheDuration: 60000, // 1 minute
    pollInterval: 60000,
    transformData: (data) => data.slice(-1)[0] // Get latest entry
  })

  if (loading) return <Skeleton className="h-[400px] w-full bg-[#FF9B99]/50" />

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Live Weather Conditions</h2>
      {weatherData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Thermometer size={16} />
              <h3 className="text-sm">Air Temperature</h3>
            </div>
            <p className="text-lg font-semibold">{weatherData.air_temperature}°C</p>
          </div>
          
          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Thermometer size={16} />
              <h3 className="text-sm">Track Temperature</h3>
            </div>
            <p className="text-lg font-semibold">{weatherData.track_temperature}°C</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Wind size={16} />
              <h3 className="text-sm">Wind</h3>
            </div>
            <p className="text-lg font-semibold">
              {weatherData.wind_speed} m/s @ {weatherData.wind_direction}°
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Droplets size={16} />
              <h3 className="text-sm">Humidity</h3>
            </div>
            <p className="text-lg font-semibold">{weatherData.humidity}%</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Droplets size={16} />
              <h3 className="text-sm">Rainfall</h3>
            </div>
            <p className="text-lg font-semibold">{weatherData.rainfall} mm</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Gauge size={16} />
              <h3 className="text-sm">Pressure</h3>
            </div>
            <p className="text-lg font-semibold">{weatherData.pressure} hPa</p>
          </div>

          <div className="p-4 bg-white/5 rounded-lg col-span-2">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <h3 className="text-sm">Last Updated</h3>
            </div>
            <p className="text-lg font-semibold">
              {new Date(weatherData.date).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ) : (
        <p>No weather data available</p>
      )}
    </Card>
  )
}
