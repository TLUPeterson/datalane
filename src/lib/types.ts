export interface Session {
  time: string
  day: string
}

export interface BaseRaceWeekend {
  name: string
  startDate: string
  endDate: string
  type: 'normal' | 'sprint'
}

export interface NormalRaceWeekend extends BaseRaceWeekend {
  type: 'normal'
  sessions: {
    fp1: Session
    fp2: Session
    fp3: Session
    qualifying: Session
    race: Session
  }
}

export interface SprintRaceWeekend extends BaseRaceWeekend {
  type: 'sprint'
  sessions: {
    fp1: Session
    sprintQualifying: Session
    sprint: Session
    qualifying: Session
    race: Session
  }
}

export type RaceWeekend = NormalRaceWeekend | SprintRaceWeekend

export interface RaceSchedule {
  [key: string]: RaceWeekend
}