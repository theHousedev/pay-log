import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { PayPeriod } from "@/types";

interface CurrentCheckProps {
    payPeriod: PayPeriod;
}

export default function CurrentCheck({ payPeriod }: CurrentCheckProps) {
    return (
        <Card className="w-full mb-4">
            <CardHeader>
                <CardTitle>Current Pay Period ({payPeriod.start} - {payPeriod.end})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-bold mb-2">Hours</h3>
                        <div className="space-y-1">
                            <div>Flight: {payPeriod.flight_hours}h</div>
                            <div>Ground: {payPeriod.ground_hours}h</div>
                            <div>Sim: {payPeriod.sim_hours}h</div>
                            <div>Admin: {payPeriod.admin_hours}h</div>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Totals</h3>
                        <div className="space-y-1">
                            <div>Total Hours: {payPeriod.all_hours}h</div>
                            <div>Gross: ${payPeriod.gross}</div>
                            <div>Remaining: {payPeriod.remaining}h</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}