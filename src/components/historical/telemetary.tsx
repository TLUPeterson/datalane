'use client';
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

// Types for API responses and component state
interface Session {
  session_key: string;
  country_name: string;
  session_name: string;
  date_start: string;
}

interface Lap {
  lap_number: number;
  lap_duration: number;
  date_start: string;
}

interface TelemetryData {
  distance: number;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  drs: number;
  gear: number;
  timestamp: Date;
}

const driversMap: Record<number, string> = {
  1: 'Max Verstappen',
  2: 'Logan Sargeant',
  3: 'Daniel Ricciardo',
  4: 'Lando Norris',
  10: 'Pierre Gasly',
  11: 'Sergio Pérez',
  14: 'Fernando Alonso',
  16: 'Charles Leclerc',
  18: 'Lance Stroll',
  20: 'Kevin Magnussen',
  22: 'Yuki Tsunoda',
  23: 'Alexander Albon',
  24: 'Zhou Guanyu',
  27: 'Nico Hülkenberg',
  30: 'Liam Lawson',
  31: 'Esteban Ocon',
  43: 'Franco Colapinto',
  44: 'Lewis Hamilton',
  55: 'Carlos Sainz Jr.',
  63: 'George Russell',
  77: 'Valtteri Bottas',
  81: 'Oscar Piastri',
};

const teamGroups: Record<string, number[]> = {
  'Red Bull': [1, 11],
  'Mercedes': [44, 63],
  'Ferrari': [16, 55],
  'McLaren': [4, 81],
  'Aston Martin': [14, 18],
  'Alpine': [10, 31],
  'Williams': [2, 23],
  'AlphaTauri': [3, 22],
  'Alfa Romeo': [24, 77],
  'Haas': [20, 27],
  'Reserve Drivers': [30, 43],
};

const TelemetryAnalysis = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [laps, setLaps] = useState<Lap[]>([]);
  const [selectedLaps, setSelectedLaps] = useState<Array<Lap & { telemetry: TelemetryData[] }>>([]);
  const [telemetryType, setTelemetryType] = useState<string>('speed');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lineColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('https://api.openf1.org/v1/sessions?year=2024');
        const data: Session[] = await response.json();
        const sortedData = data.sort((a, b) => 
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        );
        setSessions(sortedData);
      } catch (err) {
        setError('Failed to fetch sessions');
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedSession || !selectedDriver) return;

    const fetchLaps = async () => {
      try {
        const response = await fetch(
          `https://api.openf1.org/v1/laps?session_key=${selectedSession}&driver_number=${selectedDriver}`
        );
        const data: Lap[] = await response.json();
        setLaps(data);
      } catch (err) {
        setError('Failed to fetch laps');
      }
    };
    fetchLaps();
  }, [selectedSession, selectedDriver]);

  const fetchLapTelemetry = async (lap: Lap): Promise<TelemetryData[]> => {
    setLoading(true);
    try {
      const startTime = new Date(lap.date_start);
      const endTime = new Date(startTime.getTime() + lap.lap_duration * 1000);

      const response = await fetch(
        `https://api.openf1.org/v1/car_data?session_key=${selectedSession}&driver_number=${selectedDriver}&date>=${startTime.toISOString()}&date<=${endTime.toISOString()}`
      );

      const data = await response.json();

      // Normalize the distance values as percentages of lap completion (0-100)
      const processedData = data.map((point: any, index: number) => ({
        distance: (index / (data.length - 1)) * 100,
        speed: point.speed,
        rpm: point.rpm,
        throttle: point.throttle,
        brake: point.brake,
        drs: point.drs,
        gear: point.n_gear,
        timestamp: new Date(point.date),
      }));

      return processedData;
    } catch (err) {
      setError('Failed to fetch telemetry data');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleLapSelect = async (lap: Lap) => {
    if (selectedLaps.length >= 5) return;

    const telemetryData = await fetchLapTelemetry(lap);
    setSelectedLaps([...selectedLaps, { ...lap, telemetry: telemetryData }]);
  };

  const removeLap = (lapIndex: number) => {
    setSelectedLaps(selectedLaps.filter((_, index) => index !== lapIndex));
  };

  const formatLapTime = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = (duration % 60).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Select value={selectedSession || undefined} onValueChange={setSelectedSession}>
          <SelectTrigger>
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={`session-${session.session_key}`} value={session.session_key}>
                {session.country_name} - {session.session_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDriver} onValueChange={setSelectedDriver}>
          <SelectTrigger>
            <SelectValue placeholder="Select Driver" />
          </SelectTrigger>
          <SelectContent className="max-h-[400px]">
            {Object.entries(teamGroups).map(([team, drivers]) => (
              <React.Fragment key={`team-${team}`}>
                <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted">
                  {team}
                </div>
                {drivers.map((driverNumber) => (
                  <SelectItem key={`driver-${driverNumber}`} value={driverNumber.toString()}>
                    {driversMap[driverNumber]}
                  </SelectItem>
                ))}
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>

        <Select value={telemetryType} onValueChange={setTelemetryType}>
          <SelectTrigger>
            <SelectValue placeholder="Data Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="speed" value="speed">Speed</SelectItem>
            <SelectItem key="rpm" value="rpm">RPM</SelectItem>
            <SelectItem key="throttle" value="throttle">Throttle</SelectItem>
            <SelectItem key="brake" value="brake">Brake</SelectItem>
            <SelectItem key="gear" value="gear">Gear</SelectItem>
            <SelectItem key="drs" value="drs">DRS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {laps.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Lap Times for {driversMap[parseInt(selectedDriver)]}</h3>
          <LineChart
            width={800}
            height={400}
            data={laps.map((lap) => ({
              lapNumber: lap.lap_number,
              lapDuration: lap.lap_duration,
            }))}
            onClick={({ activePayload }) => activePayload && handleLapSelect(laps[activePayload[0].payload.lapNumber - 1])}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lapNumber" label="Lap Number" />
            <YAxis label="Lap Duration (s)" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="lapDuration" stroke="#8884d8" dot={false} />
          </LineChart>
        </Card>
      )}

      {selectedLaps.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Telemetry Analysis</h3>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {selectedLaps.map((lap, index) => (
              <Button 
                key={`selected-lap-${lap.lap_number}-${index}`} 
                variant="destructive" 
                onClick={() => removeLap(index)}
              >
                Lap {lap.lap_number} <X className="ml-1" />
              </Button>
            ))}
          </div>
          <LineChart width={800} height={400}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="distance"
              label="Lap Progress (%)"
              domain={[0, 100]}
            />
            <YAxis label={telemetryType} />
            <Tooltip />
            <Legend />
            {selectedLaps.map((lap, index) => (
              <Line
                key={`telemetry-${lap.lap_number}-${index}`}
                type="monotone"
                data={lap.telemetry}
                dataKey={telemetryType}
                name={`Lap ${lap.lap_number}`}
                stroke={lineColors[index % lineColors.length]}
                dot={false}
              />
            ))}
          </LineChart>
        </Card>
      )}

      {loading && (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="animate-spin" />
        </div>
      )}
    </div>
  );
};

export default TelemetryAnalysis;