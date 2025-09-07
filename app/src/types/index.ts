export type EntryType = 'flight' | 'ground' | 'sim' | 'admin' | 'misc'

export interface Entry {
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

export interface PayPeriod {
    date: string
    flight_hours: number
    ground_hours: number
    sim_hours: number
    admin_hours: number
    all_hours: number
    gross: number
    remaining: number
}