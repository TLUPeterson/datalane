"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const DUMMY_DATA = [
  { lap: 1, time: 80.5, tyre: "Soft" },
  { lap: 2, time: 80.2, tyre: "Soft" },
  { lap: 3, time: 80.3, tyre: "Soft" },
  { lap: 4, time: 80.1, tyre: "Soft" },
  { lap: 5, time: 80.4, tyre: "Soft" },
]

export function HistoricalData() {
  const [category, setCategory] = useState("lapTimes")
  
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[200px] bg-white/5">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lapTimes">Lap Times</SelectItem>
            <SelectItem value="tyreStrategy">Tyre Strategy</SelectItem>
            <SelectItem value="speedTraps">Speed Traps</SelectItem>
            <SelectItem value="sectors">Sector Times</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6 bg-white/5 border-white/10">
        <div className="w-full overflow-x-auto">
          <LineChart
            width={800}
            height={400}
            data={DUMMY_DATA}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="lap" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444" }}
            />
          </LineChart>
        </div>
      </Card>
    </div>
  )
}