"use client"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { WeatherDataComponent } from "@/components/live/weather"
import { RaceControlDataComponent } from "@/components/live/raceControls"
import { DriverPositionsComponent } from "@/components/live/driverspos"

export function LiveData() {
  const [category, setCategory] = useState("weather")

  return (
      <div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-white/5 mb-2">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weather">Weather</SelectItem>
            <SelectItem value="racecontrol">Race Control</SelectItem>
            <SelectItem value="driverspos">Positions</SelectItem>
          </SelectContent>
        </Select>

        {category === "weather" && <WeatherDataComponent />}
        {category === "racecontrol" && <RaceControlDataComponent />}
        {category === "driverspos" && <DriverPositionsComponent />}
      </div>
  )
}
