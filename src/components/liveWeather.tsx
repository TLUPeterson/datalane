'use client'
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Wind, Thermometer, Droplets, Gauge } from "lucide-react"

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

export function LiveWeather() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<WeatherData | null>(null)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(`https://api.openf1.org/v1/weather?session_key=latest`)
        if (!response.ok) throw new Error('Failed to fetch weather data')
        let result = await response.json()
        result = result[150]
        setData(result)
        console.log(result)
      } catch (error) {
        console.error('Failed to fetch weather data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full bg-white/5" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="text-center text-gray-400">
          No weather data available
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">Live Weather Conditions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Thermometer size={16} />
            <h3 className="text-sm">Air Temperature</h3>
          </div>
          <p className="text-lg font-semibold">{data.air_temperature}°C</p>
        </div>
        
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Thermometer size={16} />
            <h3 className="text-sm">Track Temperature</h3>
          </div>
          <p className="text-lg font-semibold">{data.track_temperature}°C</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Wind size={16} />
            <h3 className="text-sm">Wind</h3>
          </div>
          <p className="text-lg font-semibold">
            {data.wind_speed} m/s @ {data.wind_direction}°
          </p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Droplets size={16} />
            <h3 className="text-sm">Humidity</h3>
          </div>
          <p className="text-lg font-semibold">{data.humidity}%</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Droplets size={16} />
            <h3 className="text-sm">Rainfall</h3>
          </div>
          <p className="text-lg font-semibold">{data.rainfall} mm</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Gauge size={16} />
            <h3 className="text-sm">Pressure</h3>
          </div>
          <p className="text-lg font-semibold">{data.pressure} hPa</p>
        </div>

        <div className="p-4 bg-white/5 rounded-lg col-span-2">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <h3 className="text-sm">Last Updated</h3>
          </div>
          <p className="text-lg font-semibold">
            {new Date(data.date).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  )
}