import { useState, useCallback } from 'react';
import { getAPIPath } from '@/utils/backend';
import { useAuth } from '@/contexts/AuthContext';
import type { Entry, ViewType } from '@/types';

export const useEntries = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const apiPath = getAPIPath();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const fetchEntries = useCallback(async (view: ViewType, date?: string) => {
        if (authLoading) {
            return;
        }
        if (!isAuthenticated) {
            return;
        }
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
    }, [authLoading, isAuthenticated, apiPath]);
    return { entries, isLoading, fetchEntries };
}