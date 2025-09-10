import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { formatDateRange } from "@/utils/frontend";
import ViewSelector from "@/components/ViewSelector";
import EntriesTable from "@/components/EntriesTable";
import type { PayPeriod, ViewType, Entry } from "@/types";

interface DisplayProps {
    payPeriod: PayPeriod;
    isLoading?: boolean;
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    entries: Entry[];
    entriesLoading: boolean;
}

export default function Display({
    payPeriod,
    isLoading = false,
    view,
    onViewChange,
    entries,
    entriesLoading
}: DisplayProps) {
    if (isLoading || entriesLoading) {
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
        <Card className="w-full mb-1 gap-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 whitespace-pre-line">
                    <ViewSelector view={view} onViewChange={onViewChange} />
                    {formatDateRange(payPeriod.start, payPeriod.end)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4">
                    <div>
                        <h3 className="font-bold mb-1" style={{ width: '75%' }}>Totals</h3>
                        <div className="space-y-0.5 mr-4">
                            <div>F: {payPeriod.flight_hours.toFixed(1)}</div>
                            <div>G: {payPeriod.ground_hours.toFixed(1)}</div>
                            <div>S: {payPeriod.sim_hours.toFixed(1)}</div>
                            <div>A: {payPeriod.admin_hours.toFixed(1)}</div>
                        </div>
                    </div>
                    <div>
                        <div className="space-y-0.5">
                            <div className="font-bold">Earned</div>
                            <div>Hours: {payPeriod.all_hours.toFixed(1)}</div>
                            <div>Gross: ${payPeriod.gross.toFixed(2)}</div>
                            {payPeriod.remaining > 0 && (
                                <div>Remaining: {payPeriod.remaining.toFixed(1)}h</div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <EntriesTable
                entries={entries}
                isLoading={entriesLoading}
                onDeleteEntry={(id) => console.log('Delete entry:', id)}
            />
        </Card>

    )
}