import { RaceSchedule } from './types'

export const F1_SCHEDULE_2024: RaceSchedule = {
  "2024-03-02": {
    name: "Bahrain Grand Prix",
    startDate: "2024-02-29",
    endDate: "2024-03-02",
    type: "normal",
    sessions: {
      fp1: { time: "11:30", day: "Thursday" },
      fp2: { time: "15:00", day: "Thursday" },
      fp3: { time: "12:30", day: "Friday" },
      qualifying: { time: "16:00", day: "Friday" },
      race: { time: "15:00", day: "Saturday" }
    }
  },
  "2024-03-09": {
    name: "Saudi Arabian Grand Prix",
    startDate: "2024-03-07",
    endDate: "2024-03-09",
    type: "sprint",
    sessions: {
      fp1: { time: "13:30", day: "Thursday" },
      sprintQualifying: { time: "17:00", day: "Friday" },
      sprint: { time: "13:30", day: "Saturday" },
      qualifying: { time: "17:00", day: "Friday" },
      race: { time: "17:00", day: "Saturday" }
    }
  },
  "2024-03-24": {
    name: "Australian Grand Prix",
    startDate: "2024-10-22",
    endDate: "2024-10-24",
    type: "normal",
    sessions: {
      fp1: { time: "02:30", day: "Friday" },
      fp2: { time: "06:00", day: "Friday" },
      fp3: { time: "02:30", day: "Saturday" },
      qualifying: { time: "06:00", day: "Saturday" },
      race: { time: "05:00", day: "Sunday" }
    }
  },
  "2024-04-07": {
    name: "Japanese Grand Prix",
    startDate: "2024-10-05",
    endDate: "2024-10-07",
    type: "sprint",
    sessions: {
      fp1: { time: "04:30", day: "Friday" },
      sprintQualifying: { time: "08:00", day: "Friday" },
      sprint: { time: "04:30", day: "Saturday" },
      qualifying: { time: "08:00", day: "Saturday" },
      race: { time: "07:00", day: "Sunday" }
    }
  }
}