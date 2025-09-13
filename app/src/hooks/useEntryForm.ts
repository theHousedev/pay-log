import type { Entry, EntryType } from "@/types";
import { useState } from "react";

export const useEntryForm = () => {
    const [entryData, setEntryData] = useState<Entry>({
        id: '',
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
            id: currentEntry.id,
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
        setEntryData(prev => ({
            ...prev,
            type: type,
            flight_hours: null,
            ground_hours: null,
            sim_hours: null,
            admin_hours: null,
            ride_count: null
        }));
    }

    const cleanEntry = (entry: Entry): Entry => {
        const cleanEntry = { ...entry };

        switch (entry.type) {
            case 'flight':
                cleanEntry.sim_hours = null;
                cleanEntry.admin_hours = null;
                cleanEntry.ride_count = null;
                break;
            case 'ground':
                cleanEntry.sim_hours = null;
                cleanEntry.admin_hours = null;
                cleanEntry.ride_count = null;
                break;
            case 'sim':
                cleanEntry.flight_hours = null;
                cleanEntry.admin_hours = null;
                cleanEntry.ride_count = null;
                break;
            case 'admin':
                if (entry.ride_count) {
                    cleanEntry.customer = '';
                    cleanEntry.admin_hours = null;
                }
                break;
            case 'misc':
                break;
        }
        return cleanEntry;
    }

    return { entryData, cleanEntry, resetEntryForm, handleFieldChange, handleFormChange }
}