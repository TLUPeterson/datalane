import React, { useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataFetching } from "@/hooks/liveDataFetch";
import { ArrowUp, ArrowDown } from "lucide-react";

interface DriverPosition {
  date: string;
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

interface SessionInfo {
  session_name: string;
  session_key: number;
  session_type: string;
  meeting_key: number;
}

type TyreCompound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET';

interface StintInfo {
  compound: TyreCompound;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  stint_number: number;
  tyre_age_at_start: number;
}

const driversMap: { [key: number]: string } = {
  1: "Max Verstappen",
  2: "Logan Sargeant",
  3: "Daniel Ricciardo",
  4: "Lando Norris",
  10: "Pierre Gasly",
  11: "Sergio Pérez",
  14: "Fernando Alonso",
  16: "Charles Leclerc",
  18: "Lance Stroll",
  20: "Kevin Magnussen",
  22: "Yuki Tsunoda",
  23: "Alexander Albon",
  24: "Zhou Guanyu",
  27: "Nico Hülkenberg",
  30: "Liam Lawson",
  31: "Esteban Ocon",
  43: "Franco Colapinto",
  44: "Lewis Hamilton",
  55: "Carlos Sainz Jr.",
  63: "George Russell",
  77: "Valtteri Bottas",
  81: "Oscar Piastri"
};

const colors: { [K in TyreCompound]: string } = {
  SOFT: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  HARD: "bg-white",
  INTERMEDIATE: "bg-green-500",
  WET: "bg-blue-500"
};

const TyreIndicator = ({ compound }: { compound: TyreCompound }) => {
  return (
    <div className="flex items-center space-x-1">
      <div className={`w-3 h-3 border-black border-2 rounded-full ${colors[compound] || "text-gray-500"}`}/>
      <span className="text-sm">{compound.charAt(0)}</span>
    </div>
  );
};

const PositionDelta = ({ current, start }: { current: number; start: number }) => {
  const delta = start - current;
  //if (delta === 0) return null;

  return (
    <div className={`flex items-center space-x-1 ${delta > 0 ? "text-green-500" : delta < 0 ? "text-red-500" : "text-yellow-600"}`}>
      {delta > 0 ? <ArrowUp className="w-4 h-4" /> : delta < 0 ? <ArrowDown className="w-4 h-4" /> : null}
      <span className="text-sm font-medium">{Math.abs(delta)}</span>
    </div>
  );
};

const TyreAge = ({ stintInfo }: { stintInfo?: StintInfo }) => {
  if (!stintInfo) return null;

  const age = (stintInfo.lap_end - stintInfo.lap_start + 1) + stintInfo.tyre_age_at_start;
  
  return (
    <div className="text-sm text-gray-400">
      {age} laps old
    </div>
  );
};

function useStartingPositions(currentSession: SessionInfo | null) {
  // First, fetch all sessions for the current year
  const { data: allSessions } = useDataFetching<SessionInfo[]>({
    url: 'https://api.openf1.org/v1/sessions?year=2024',
    cacheKey: 'all_sessions_2024',
    cacheDuration: 3600000, // Cache for 1 hour
    pollInterval: 3600000,
  });

  const qualifyingSession = useMemo(() => {
    if (!currentSession || !allSessions) return null;

    // Filter sessions for the current meeting
    const meetingSessions = allSessions.filter(
      session => session.meeting_key === currentSession.meeting_key
    );

    // For Sprint races, we need the Sprint Qualifying results
    if (currentSession.session_name === "Sprint") {
      return meetingSessions.find(session => 
        session.session_name === "Sprint Qualifying"
      );
    }
    
    // For main races, we need the regular Qualifying results
    if (currentSession.session_type === "Race") {
      return meetingSessions.find(session => 
        session.session_name === "Qualifying"
      );
    }

    return null;
  }, [currentSession, allSessions]);

  const { data: qualiData } = useDataFetching<DriverPosition[]>({
    url: qualifyingSession 
      ? `https://api.openf1.org/v1/position?session_key=${qualifyingSession.session_key}`
      : '',
    cacheKey: `qualifying_positions_${qualifyingSession?.session_key}`,
    cacheDuration: 3600000, // Cache for 1 hour since quali results don't change
    pollInterval: 3600000,
    transformData: (data: DriverPosition[]) => {
      // Get the final qualifying positions
      const positionMap = new Map<number, DriverPosition>();
      const sortedData = [...data].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      sortedData.forEach(entry => {
        if (!positionMap.has(entry.driver_number)) {
          positionMap.set(entry.driver_number, entry);
        }
      });
      
      return Array.from(positionMap.values())
        .sort((a, b) => a.position - b.position);
    }
  });

  return qualiData || [];
}


function DriverPositionsComponent() {
  const { data: sessionData } = useDataFetching<SessionInfo[]>({
    url: 'https://api.openf1.org/v1/sessions?session_key=latest',
    cacheKey: 'current_session',
    cacheDuration: 30000,
    pollInterval: 30000
  });

  const { data: positionsData, loading } = useDataFetching<DriverPosition[]>({
    url: 'https://api.openf1.org/v1/position?session_key=latest',
    cacheKey: 'current_positions',
    cacheDuration: 10000,
    pollInterval: 10000
  });

  const { data: stintsData } = useDataFetching<StintInfo[]>({
    url: 'https://api.openf1.org/v1/stints?session_key=latest',
    cacheKey: 'current_stints',
    cacheDuration: 10000,
    pollInterval: 10000
  });

  const currentSession = sessionData?.[0] || null;
  const startingPositions = useStartingPositions(currentSession);
  const isRaceSession = currentSession?.session_type === "Race" || currentSession?.session_name === "Sprint";

  const startingPositionsMap = useMemo(() => {
    const map = new Map<number, number>();
    startingPositions.forEach(pos => {
      map.set(pos.driver_number, pos.position);
    });
    return map;
  }, [startingPositions]);

  const latestPositions = useMemo(() => {
    if (!positionsData) return [];
    
    const positionMap = new Map<number, DriverPosition>();
    const sortedData = [...positionsData].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sortedData.forEach(entry => {
      if (!positionMap.has(entry.driver_number)) {
        positionMap.set(entry.driver_number, entry);
      }
    });

    return Array.from(positionMap.values())
      .sort((a, b) => a.position - b.position);
  }, [positionsData]);

  const currentStints = useMemo(() => {
    if (!stintsData) return new Map();
    
    const stintMap = new Map<number, StintInfo>();
    stintsData.forEach(stint => {
      const existingStint = stintMap.get(stint.driver_number);
      if (!existingStint || stint.stint_number > existingStint.stint_number) {
        stintMap.set(stint.driver_number, stint);
      }
    });
    
    return stintMap;
  }, [stintsData]);

  if (loading) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <h2 className="text-2xl font-bold mb-6">Race Tracker</h2>
        <div className="space-y-2">
          {[...Array(20)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-[#FF9B99]/50" />
          ))}
        </div>
      </Card>
    );
  }

  if (!latestPositions.length) {
    return (
      <Card className="p-6 bg-white/5 border-white/10">
        <p>No position data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <h2 className="text-2xl font-bold mb-6">
        Race Tracker
        {currentSession && (
          <span className="text-sm font-normal text-gray-400 ml-2">
            {currentSession.session_name}
          </span>
        )}
      </h2>
      <div className="space-y-2">
        {latestPositions.map((driver) => {
          const currentStint = currentStints.get(driver.driver_number);
          const startPos = startingPositionsMap.get(driver.driver_number);
          const positionColor = driver.position === 1 ? "text-yellow-400" :
                                driver.position === 2 ? "text-gray-300" :
                                driver.position === 3 ? "text-orange-400" : "text-gray-400";

          return (
            <div 
              key={driver.driver_number}
              className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-[48px_300px_160px_30px_120px_120px] items-center gap-4">
                {/* Current Position */}
                <span className={`text-2xl font-bold ${positionColor}`}>
                  P{driver.position}
                </span>
                
                {/* Driver Name */}
                <div className="overflow-hidden">
                  <span className="text-lg font-semibold">
                    {driversMap[driver.driver_number] || "Unknown Driver"}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">
                    #{driver.driver_number}
                  </span>
                </div>

                {/* Starting Position */}
                {isRaceSession && startPos ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400 w-16">Start: P{startPos}</span>
                    <PositionDelta 
                      current={driver.position} 
                      start={startPos}
                    />
                  </div>
                ) : (
                  <div />
                )}
                
                {/* Tyre Type */}
                <div>
                  {currentStint && <TyreIndicator compound={currentStint.compound} />}
                </div>
                
                {/* Tyre Stint Length */}
                <div>
                  {currentStint && <TyreAge stintInfo={currentStint} />}
                </div>
                
                {/* Last Update */}
                <div className="text-sm text-gray-400 text-right">
                  {new Date(driver.date).toLocaleTimeString()}
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex items-center space-x-3">
                  {/* Position */}
                  <span className={`text-2xl font-bold ${positionColor}`}>
                    P{driver.position}
                  </span>
                  
                  {/* Driver Name */}
                  <div className="flex-1">
                    <span className="text-lg font-semibold">
                      {driversMap[driver.driver_number] || "Unknown Driver"}
                    </span>
                    <span className="text-sm text-gray-400 ml-2">
                      #{driver.driver_number}
                    </span>
                  </div>
                </div>

                {/* Additional Info Row */}
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                  {isRaceSession && startPos && (
                    <div className="flex items-center space-x-2">
                      <span>Start: P{startPos}</span>
                      <PositionDelta 
                        current={driver.position} 
                        start={startPos}
                      />
                    </div>
                  )}
                  
                  {currentStint && (
                    <>
                      <div className="flex items-center space-x-2">
                        <TyreIndicator compound={currentStint.compound} />
                      </div>
                      <TyreAge stintInfo={currentStint} />
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default DriverPositionsComponent;