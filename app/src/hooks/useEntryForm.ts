import type { Entry, EntryType } from "@/types";
import { useState } from "react";

export const useEntryForm = () => {
    const [entryData, setEntryData] = useState<Entry>({
        type: 'flight',
        date: new Date().toLocaleDateString("en-CA"),
        time: new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        }),
        flight_hours: null,
        ground_hours: null,
        sim_hours: null,
        admin_hours: null,
        customer: '',
        notes: '',
        ride_count: null,
        meeting: false
    })

    const resetEntryForm = (currentEntry: Entry): Entry => {
        return {
            type: currentEntry.type,
            date: currentEntry.date,
            time: currentEntry.time,
            flight_hours: null,
            ground_hours: null,
            sim_hours: null,
            admin_hours: null,
            customer: '',
            notes: '',
            ride_count: null,
            meeting: false
        };
    }

    const handleFieldChange = (field: keyof Entry, value: string | number) => {
        let convertedValue: string | number | null = value;

        if (field === 'flight_hours' || field === 'ground_hours' ||
            field === 'sim_hours' || field === 'admin_hours' || field === 'ride_count') {
            convertedValue = value === '' ? null : parseFloat(value as string);
        }

        setEntryData(prev => ({ ...prev, [field]: convertedValue }))
    }

    const handleFormChange = (type: EntryType) => {
        setEntryData(prev => ({ ...prev, type: type }))
    }

    return { entryData, resetEntryForm, handleFieldChange, handleFormChange }
}