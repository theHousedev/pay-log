import { useRef, useState } from "react";

import type { Entry, PayPeriod } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getAPIPath } from "@/utils/backend";

export const usePayPeriod = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [payPeriod, setPayPeriod] = useState<PayPeriod>({
        start: '',
        end: '',
        flight_hours: 0,
        ground_hours: 0,
        sim_hours: 0,
        admin_hours: 0,
        all_hours: 0,
        gross: 0,
        remaining: 0
    })

    const [currentRates, setCurrentRates] = useState({
        cfi_rate: 26.50, admin_rate: 13.75
    })
    const [isLoading, setIsLoading] = useState(true);
    const hasFetched = useRef(false)
    const apiPath = getAPIPath();

    const calculateEntryValue = (entry: Entry): number => {
        const cfiHours = (entry.flight_hours || 0) +
            (entry.ground_hours || 0) + (entry.sim_hours || 0);
        const rideHours = (entry.ride_count || 0) * 0.2;
        const totalAdminHours = (entry.admin_hours || 0) + rideHours;
        const cfiPay = cfiHours * currentRates.cfi_rate;
        const adminPay = totalAdminHours * currentRates.admin_rate;

        return cfiPay + adminPay;
    };

    const refreshPayPeriod = async () => {
        hasFetched.current = false;
        await fetchPayPeriod(true);
    };

    const fetchPayPeriod = async (forceRefresh = false) => {
        if (authLoading ||
            !isAuthenticated ||
            (hasFetched.current && !forceRefresh)) {
            // skip fetch
            return;
        }

        hasFetched.current = true;
        try {
            const response = await fetch(`${apiPath}/current-period`);
            const result = await response.json();

            if (result.status === 'OK' && result.data) {
                const { period, totals } = result.data;
                const newPayPeriod = {
                    start: period.begin_date,
                    end: period.end_date,
                    flight_hours: totals.flight_hours || 0,
                    ground_hours: totals.ground_hours || 0,
                    sim_hours: totals.sim_hours || 0,
                    admin_hours: totals.admin_hours || 0,
                    ride_hours: totals.ride_hours || 0,
                    total_rides: totals.total_rides || 0,
                    all_hours: totals.total_hours || 0,
                    gross: totals.total_gross || 0,
                    remaining: 0 // TODO: calculate remaining hours
                };
                setPayPeriod(newPayPeriod);

                setCurrentRates({
                    cfi_rate: totals.cfi_rate || 26.50,
                    admin_rate: totals.admin_rate || 13.75
                });
            }
        } catch (error) {
            console.error('Error fetching current period:', error);
            hasFetched.current = false;
        } finally {
            setIsLoading(false);
        }
    }

    return { payPeriod, currentRates, fetchPayPeriod, calculateEntryValue, refreshPayPeriod, isLoading }
}