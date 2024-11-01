import React, { createContext, useContext, useMemo } from 'react';
import { useDataFetching } from "@/hooks/liveDataFetch";

interface SessionInfo {
  session_name: string;
  session_key: number;
  session_type: string;
  meeting_key: number;
}

// Create a context for session data
const SessionContext = createContext<{
  currentSession: SessionInfo | null;
  allSessions: SessionInfo[];
}>({
  currentSession: null,
  allSessions: []
});

// Provider component to wrap your app or a section of your app
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fetch latest session
  const { data: currentSessionData } = useDataFetching<SessionInfo[]>({
    url: 'https://api.openf1.org/v1/sessions?session_key=latest',
    cacheKey: 'current_session',
    cacheDuration: 30000,
    pollInterval: 30000
  });

  // Fetch all sessions for the year
  const { data: allSessionsData } = useDataFetching<SessionInfo[]>({
    url: 'https://api.openf1.org/v1/sessions?year=2024',
    cacheKey: 'all_sessions_2024',
    cacheDuration: 3600000, // Cache for 1 hour
    pollInterval: 3600000,
  });

  const value = useMemo(() => ({
    currentSession: currentSessionData?.[0] || null,
    allSessions: allSessionsData || []
  }), [currentSessionData, allSessionsData]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use session data
export const useSessionData = () => {
  return useContext(SessionContext);
};