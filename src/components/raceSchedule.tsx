"use client"

import { Calendar, momentLocalizer, Event, View } from 'react-big-calendar'
import "react-big-calendar/lib/css/react-big-calendar.css"
import moment from 'moment'
import 'moment-timezone'
import { F1_SCHEDULE_2024 } from "@/lib/f1Schedule"
import { useState, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import { RaceWeekend } from "@/lib/f1Schedule"
import { CalendarDays, Clock, Flag, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// For monday as first day of the week
moment.updateLocale('en-gb', {
  week: {
    dow: 1,
  },
});
const localizer = momentLocalizer(moment);

interface F1Event extends Event {
  resource: RaceWeekend
}

const sessionIcons = {
  fp1: <Clock className="w-4 h-4 text-gray-400" />,
  fp2: <Clock className="w-4 h-4 text-gray-400" />,
  fp3: <Clock className="w-4 h-4 text-gray-400" />,
  qualifying: <Zap className="w-4 h-4 text-yellow-500" />,
  race: <Flag className="w-4 h-4 text-red-500" />,
  sprint: <Zap className="w-4 h-4 text-orange-500" />,
  sprintQualifying: <Zap className="w-4 h-4 text-yellow-500" />,
}

const formatSessionName = (session: string) => {
  switch (session) {
    case 'fp1':
      return 'Free Practice 1'
    case 'fp2':
      return 'Free Practice 2'
    case 'fp3':
      return 'Free Practice 3'
    case 'qualifying':
      return 'Qualifying'
    case 'race':
      return 'Race'
    case 'sprint':
      return 'Sprint Race'
    case 'sprintQualifying':
      return 'Sprint Qualifying'
    default:
      return session
  }
}

// Convert EET time to local time
const convertToLocalTime = (startDate: string, time: string, day: string) => {
  // Get the start date as a moment object
  const baseDate = moment(startDate)
  
  // Map day names to offsets from the start date
  const dayOffsets: { [key: string]: number } = {
    'Friday': 0,
    'Saturday': 1,
    'Sunday': 2
  }
  
  // Create a new date for the session
  const sessionDate = baseDate.clone().add(dayOffsets[day], 'days')
  
  // Set the time
  const [hours, minutes] = time.split(':')
  sessionDate.hours(parseInt(hours))
  sessionDate.minutes(parseInt(minutes))
  
  // Convert to local timezone
  const localTime = sessionDate.clone().tz(moment.tz.guess())
  
  return {
    day: localTime.format('MMM D'),
    time: localTime.format('HH:mm'),
    timezone: moment.tz.guess()
  }
}

export function RaceSchedule() {
  const [selectedRace, setSelectedRace] = useState<RaceWeekend | null>(null)
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const events: F1Event[] = Object.entries(F1_SCHEDULE_2024).map(([, race]) => ({
    title: race.name,
    start: new Date(race.startDate),
    end: new Date(race.endDate),
    allDay: true,
    resource: race,
  }))

  const handleSelectEvent = useCallback((event: F1Event) => {
    setSelectedRace(event.resource)
  }, [])

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const eventStyleGetter = useCallback((event: F1Event) => {
    const isSprintWeekend = event.resource.type === 'sprint'
    return {
      style: {
        backgroundColor: isSprintWeekend ? '#f97316' : '#ef4444',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block',
      },
    }
  }, [])

  const SessionDetails = useCallback(({ race }: { race: RaceWeekend }) => {
    // Sort sessions by day and time
    const sortedSessions = Object.entries(race.sessions)
      .sort(([, a], [, b]) => {
        // First sort by day
        const days = ['Friday', 'Saturday', 'Sunday']
        const dayDiff = days.indexOf(a.day) - days.indexOf(b.day)
        if (dayDiff !== 0) return dayDiff
        
        // If same day, sort by time
        return a.time.localeCompare(b.time)
      })

    return (
      <div className="space-y-4">
        {sortedSessions.map(([session, details]) => {
          const localTime = convertToLocalTime(
            race.startDate,
            details.time,
            details.day
          )
          
          return (
            <div 
              key={session} 
              className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                {sessionIcons[session as keyof typeof sessionIcons]}
                <h3 className="font-semibold">
                  {formatSessionName(session)}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CalendarDays className="w-4 h-4" />
                <span>{localTime.day}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{localTime.time}</span>
                <span className="ml-1">({localTime.timezone})</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="calendar-container">
        <Calendar<F1Event>
          key={`calendar-${view}`}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month']}
          date={date}
          onNavigate={handleNavigate}
          view={view}
          onView={setView}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          className="bg-white/5 rounded-lg p-4"
          popup
          components={{
            toolbar: props => (
              <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                  <button type="button" onClick={() => props.onNavigate('PREV')}>Back</button>
                  <button type="button" onClick={() => props.onNavigate('TODAY')}>Today</button>
                  <button type="button" onClick={() => props.onNavigate('NEXT')}>Next</button>
                </span>
                <span className="rbc-toolbar-label">{props.label}</span>
                <span className="rbc-btn-group"></span>
              </div>
            ),
          }}
        />
      </div>

      <div>
        <Card className="p-6 bg-white/5 border-white/10 min-h-[400px]">
          {selectedRace ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedRace.name}</h2>
                  <Badge className={`mt-2 ${selectedRace.type === 'sprint' ? 'bg-orange-500' : 'bg-red-500'}`}>
                    {selectedRace.type === 'sprint' ? 'Sprint Weekend' : 'Race Weekend'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  {moment(selectedRace.startDate).format('MMM D')} - {moment(selectedRace.endDate).format('D, YYYY')}
                </div>
              </div>
              <SessionDetails race={selectedRace} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Flag className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a race weekend to view session times</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}