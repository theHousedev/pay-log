export type EntryType = 'flight' | 'ground' | 'sim' | 'admin' | 'misc'
export type ViewType = 'period' | 'day' | 'week' | 'all'

export interface Entry {
    id: string
    type: EntryType
    date: string
    time: string
    flight_hours: number | null
    ground_hours: number | null
    sim_hours: number | null
    admin_hours: number | null
    customer: string
    notes: string
    ride_count: number | null
    meeting: boolean
}

export interface PayRates {
    effective_date: string
    cfi_rate: number
    admin_rate: number
}

export interface PayPeriod {
    start: string
    end: string
    flight_hours: number
    ground_hours: number
    sim_hours: number
    admin_hours: number
    ride_hours?: number
    total_rides?: number
    all_hours: number
    gross: number
    remaining: number
}

export interface ViewTotals {
    flight_hours: number
    ground_hours: number
    sim_hours: number
    admin_hours: number
    all_hours: number
    gross: number
}