import { useState, useEffect, useCallback } from "react";

import type { HistPayPeriod } from "@/types";
import { getAPIPath } from "@/utils/backend";
import { useAuth } from "@/contexts/AuthContext";

export const useHistPeriod = () => {
    const [allPeriods, setAllPeriods] = useState<HistPayPeriod[]>([]);
    const [selectedPeriodID, setSelectedPeriodID] = useState<number | null>(null);
    const { isAuthenticated } = useAuth();
    const apiPath = getAPIPath();

    const fetchAllPeriods = useCallback(async () => {
        try {
            const response = await fetch(`${apiPath}/periods`);
            const result = await response.json();

            if (result.status === 'OK' && result.data) {
                const transformed = result.data.map((p: any) => ({ // eslint-disable-line
                    id: p.id,
                    start: p.begin_date,
                    end: p.end_date,
                    status: p.status,
                    total_hours: p.total_hours,
                    gross_earnings: p.gross_earnings,
                }));
                setAllPeriods(transformed);
            }
        } catch (error) {
            console.error('Error fetching all periods: ', error);
        }
    }, [isAuthenticated, apiPath]); // eslint-disable-line

    useEffect(() => {
        if (isAuthenticated) {
            fetchAllPeriods();
        }
    }, [isAuthenticated, fetchAllPeriods]);

    const selectedPeriod = allPeriods.find(p => p.id === selectedPeriodID) || null;

    return {
        allPeriods,
        selectedPeriodID,
        setSelectedPeriodID,
        selectedPeriod,
        fetchAllPeriods,
    }
}