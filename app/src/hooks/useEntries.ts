import { useState } from 'react';
import type { Entry, ViewType } from '@/types';
import { getAPIPath } from '@/utils/backend';

export const useEntries = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const apiPath = getAPIPath();

    const fetchEntries = async (view: ViewType, date?: string) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ view });
            if (date) params.append('date', date);

            const response = await fetch(`${apiPath}/get-entries?${params}`);
            const result = await response.json();

            if (result.status === 'OK' && result.data) {
                setEntries(result.data);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return { entries, isLoading, fetchEntries };
}