import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { PayPeriod } from "@/types";

interface CurrentCheckProps {
    payPeriod: PayPeriod;
    isLoading?: boolean;
}

export default function CurrentCheck({ payPeriod, isLoading = false }: CurrentCheckProps) {
    // attempts to correct timezone offset; dates should be validated per-period
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card className="w-full mb-4">
                <CardHeader>
                    <CardTitle>Loading Current Pay Period...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground">
                        Fetching data from backend...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full mb-4">
            <CardHeader>
                <CardTitle>
                    {formatDate(payPeriod.start)} - {formatDate(payPeriod.end)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    <div>
                        <h3 className="font-bold mb-1" style={{ width: '75%' }}>Totals</h3>
                        <div className="space-y-0.5 mr-4">
                            <div>Flight {payPeriod.flight_hours.toFixed(1)}hrs</div>
                            <div>Ground {payPeriod.ground_hours.toFixed(1)}hrs</div>
                            <div>Sim {payPeriod.sim_hours.toFixed(1)}hrs</div>
                            <div>Admin {payPeriod.admin_hours.toFixed(1)}hrs</div>
                        </div>
                    </div>
                    <div>
                        <div className="space-y-0.5">
                            <div className="font-bold">Earned</div>
                            <div>Hours: {payPeriod.all_hours.toFixed(1)}h</div>
                            <div>Gross: ${payPeriod.gross.toFixed(2)}</div>
                            {payPeriod.remaining > 0 && (
                                <div>Remaining: {payPeriod.remaining.toFixed(1)}h</div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}