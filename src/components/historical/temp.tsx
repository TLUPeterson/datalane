import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
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
import { X } from 'lucide-react';

const API_BASE = 'https://api.openf1.org/v1';

// Define types for our data structures
interface Session {
  session_key: string;
  session_name: string;
  circuit_short_name: string;
  date_start: string;
}

interface Lap {
  lap_number: number;
  lap_duration: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  date_start: string;
  is_pit_out_lap: boolean;
}

interface TelemetryPoint {
  date: string;
  speed: number;
  rpm: number;
  throttle: number;
  brake: number;
  drs: number;
  n_gear: number;
  timeFromStart: number;
}

const TelemetryAnalysis = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionKey, setSessionKey] = useState('latest');
  const [driver, setDriver] = useState('');
  const [telemetryType, setTelemetryType] = useState('speed');
  const [laps, setLaps] = useState<Lap[]>([]);
  const [selectedLaps, setSelectedLaps] = useState<Lap[]>([]);
  const [telemetryData, setTelemetryData] = useState<Record<number, TelemetryPoint[]>>({});
  const [loading, setLoading] = useState(false);

  // Colors for different laps in the comparison
  const lineColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

  // Fetch available sessions
  useEffect(() => {
    fetch(`${API_BASE}/sessions?year=2024`)
      .then(res => res.json())
      .then((data: Session[]) => {
        setSessions(data.sort((a, b) => 
          new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
        ));
      });
  }, []);

  // Fetch lap data for the selected session and driver
  useEffect(() => {
    if (sessionKey && driver) {
      setLoading(true);
      fetch(`${API_BASE}/laps?session_key=${sessionKey}&driver_number=${driver}`)
        .then(res => res.json())
        .then((data: Lap[]) => {
          const validLaps = data.filter(lap => 
            !lap.is_pit_out_lap && 
            lap.lap_duration && 
            lap.duration_sector_1 && 
            lap.duration_sector_2 && 
            lap.duration_sector_3
          );
          setLaps(validLaps);
        })
        .finally(() => setLoading(false));
    }
  }, [sessionKey, driver]);

  // Fetch telemetry data for a selected lap
  const fetchTelemetryForLap = useCallback(async (lap: Lap) => {
    const startTime = new Date(lap.date_start);
    const endTime = new Date(startTime.getTime() + (lap.lap_duration * 1000));
    
    const response = await fetch(
      `${API_BASE}/car_data?` +
      `session_key=${sessionKey}&` +
      `driver_number=${driver}&` +
      `date>=${startTime.toISOString()}&` +
      `date<=${endTime.toISOString()}`
    );
    
    const data: Omit<TelemetryPoint, 'timeFromStart'>[] = await response.json();
    
    // Process the telemetry data to be relative to lap start time
    return data.map(point => ({
      ...point,
      timeFromStart: (new Date(point.date).getTime() - startTime.getTime()) / 1000
    }));
  }, [sessionKey, driver]);

  // Handle lap selection
  const handleLapSelect = useCallback(async (lap: Lap) => {
    if (selectedLaps.length < 5 && !selectedLaps.find(l => l.lap_number === lap.lap_number)) {
      setLoading(true);
      try {
        const telemetry = await fetchTelemetryForLap(lap);
        setTelemetryData(prev => ({
          ...prev,
          [lap.lap_number]: telemetry
        }));
        setSelectedLaps(prev => [...prev, lap]);
      } catch (error) {
        console.error('Error fetching telemetry:', error);
      }
      setLoading(false);
    }
  }, [selectedLaps, fetchTelemetryForLap]);

  const removeLap = (lapNumber: number) => {
    setSelectedLaps(prev => prev.filter(lap => lap.lap_number !== lapNumber));
    const newTelemetryData = { ...telemetryData };
    delete newTelemetryData[lapNumber];
    setTelemetryData(newTelemetryData);
  };

  const formatLapTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const lap = payload[0].payload;
      return (
        <div className="bg-slate-900 p-2 rounded-lg border border-slate-700">
          <p className="text-sm">Lap: {lap.lap_number}</p>
          <p className="text-sm">Time: {formatLapTime(lap.lap_duration)}</p>
          <p className="text-sm">S1: {lap.duration_sector_1.toFixed(3)}s</p>
          <p className="text-sm">S2: {lap.duration_sector_2.toFixed(3)}s</p>
          <p className="text-sm">S3: {lap.duration_sector_3.toFixed(3)}s</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Select value={driver} onValueChange={setDriver}>
          <SelectTrigger>
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">VER</SelectItem>
            <SelectItem value="11">PER</SelectItem>
            <SelectItem value="44">HAM</SelectItem>
            <SelectItem value="63">RUS</SelectItem>
            <SelectItem value="16">LEC</SelectItem>
            <SelectItem value="55">SAI</SelectItem>
            <SelectItem value="4">NOR</SelectItem>
            <SelectItem value="81">PIA</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sessionKey} onValueChange={setSessionKey}>
          <SelectTrigger>
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Current Session</SelectItem>
            {sessions.map((session) => (
              <SelectItem key={session.session_key} value={session.session_key}>
                {session.circuit_short_name} - {session.session_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={telemetryType} onValueChange={setTelemetryType}>
          <SelectTrigger>
            <SelectValue placeholder="Data Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="speed">Speed</SelectItem>
            <SelectItem value="rpm">RPM</SelectItem>
            <SelectItem value="throttle">Throttle</SelectItem>
            <SelectItem value="brake">Brake</SelectItem>
            <SelectItem value="drs">DRS</SelectItem>
            <SelectItem value="n_gear">Gear</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      )}

      {/* Lap Times Graph */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Lap Times</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="lap_number" 
                type="number" 
                domain={['dataMin', 'dataMax']}
                label={{ value: 'Lap Number', position: 'bottom' }}
              />
              <YAxis
                dataKey="lap_duration"
                domain={['auto', 'auto']}
                label={{ value: 'Lap Time (s)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={laps}
                fill="#8884d8"
                line={{ stroke: '#8884d8', strokeWidth: 1 }}
                onClick={(data) => handleLapSelect(data)}
                cursor="pointer"
              />
              {selectedLaps.map((lap, index) => (
                <Scatter
                  key={index}
                  data={[lap]}
                  fill={lineColors[index]}
                  r={6}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Laps Tags */}
        {selectedLaps.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedLaps.map((lap, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{ backgroundColor: `${lineColors[index]}20` }}
              >
                <span className="text-sm">
                  Lap {lap.lap_number} - {formatLapTime(lap.lap_duration)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => removeLap(lap.lap_number)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sector Times Comparison */}
      {selectedLaps.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sector Times</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={selectedLaps}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lap_number" />
                <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="duration_sector_1" name="Sector 1" stackId="a" fill="#ef4444" />
                <Bar dataKey="duration_sector_2" name="Sector 2" stackId="a" fill="#3b82f6" />
                <Bar dataKey="duration_sector_3" name="Sector 3" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Telemetry Comparison */}
      {selectedLaps.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Telemetry Comparison</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timeFromStart"
                  label={{ value: 'Time (s)', position: 'bottom' }}
                />
                <YAxis
                  label={{
                    value: telemetryType === 'speed' ? 'Speed (km/h)' :
                           telemetryType === 'rpm' ? 'RPM' :
                           telemetryType === 'throttle' ? 'Throttle (%)' :
                           telemetryType === 'brake' ? 'Brake (%)' :
                           telemetryType === 'drs' ? 'DRS' :
                           'Gear',
                    angle: -90,
                    position: 'insideLeft'
                  }}
                />
                <Tooltip />
                <Legend />

                {selectedLaps.map((lap, index) => (
                  <Line
                    key={index}
                    data={telemetryData[lap.lap_number] || []}
                    type="monotone"
                    dataKey={telemetryType}
                    stroke={lineColors[index]}
                    strokeWidth={2}
                    dot={false}
                    name={`Lap ${lap.lap_number}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TelemetryAnalysis;