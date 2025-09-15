import { useState } from 'react';
import { getAPIPath } from '@/utils/backend';
import { useAuth } from '@/contexts/AuthContext';
import type { ViewType } from '@/types';

interface ViewTotals {
    flight_hours: number;
    ground_hours: number;
    sim_hours: number;
    admin_hours: number;
    all_hours: number;
    gross: number;
    cfi_rate: number;
    admin_rate: number;
}

export const useViewTotals = () => {
    const [viewTotals, setViewTotals] = useState<ViewTotals | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const apiPath = getAPIPath();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const fetchViewTotals = async (view: ViewType, date?: string) => {
        if (view === 'period') {
            setViewTotals(null);
            return;
        }

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

            const response = await fetch(`${apiPath}/get-totals?${params}`, {
                credentials: 'include'
            });

            if (response.status === 200) {
                const result = await response.json();
                if (result.status === 'OK' && result.data) {
                    setViewTotals(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching view totals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { viewTotals, isLoading, fetchViewTotals };
};