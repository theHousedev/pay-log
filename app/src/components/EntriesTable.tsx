import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Entry } from "@/types";
import { format } from "date-fns";

interface EntriesTableProps {
    entries: Entry[];
    isLoading: boolean;
    onDeleteEntry: (id: number) => void;
}

export default function EntriesTable({ entries, isLoading, onDeleteEntry }: EntriesTableProps) {
    const fmtTime = (timeStr: string) => {
        timeStr = timeStr.replace(':', '');
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    const fmtHours = (hours: number | null) => {
        if (hours === null || hours === undefined) return '-';
        return hours.toFixed(1);
    };

    const fmtDate = (dateStr: string) => {
        if (!dateStr) return '';
        //     const date = new Date(dateStr);
        //     return `${format(date, 'dd')}${format(date, 'MMM')}`;
        // };
        const datePart = dateStr.split('T')[0]; // Gets "2025-09-09"
        const [year, month, day] = datePart.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const fmtName = (fullName: string | null) => {
        if (!fullName || fullName.trim() === '') return '-';
        const parts = fullName.trim().split(' ');
        return parts[parts.length - 1];
    };

    if (isLoading) {
        return (
            <Card className="w-full mb-0">
                <CardContent className="p-0">
                    <div className="text-center text-muted-foreground">
                        Loading entries...
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (entries.length === 0) {
        return (
            <Card className="w-full mb-4">
                <CardContent className="p-0">
                    <div className="text-center text-muted-foreground">
                        No entries for this period.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-100% mb-0">
            <CardHeader>
                <CardTitle>Entries</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs max-w-[650px]">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-0 sm:table-cell">Time</th>
                                <th className="text-left p-0">F</th>
                                <th className="text-left p-0">G</th>
                                <th className="text-left p-0 md:table-cell">S</th>
                                <th className="text-left p-0 md:table-cell">A</th>
                                <th className="text-left p-1 sm:table-cell">Customer</th>
                                <th className="text-left p-0 sm:table-cell">Rides</th>
                                <th className="text-left p-1 hidden lg:table-cell">Notes</th>
                                <th className="text-right p-1"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b hover:bg-gray-50">
                                    <td className="p-0">
                                        <div className="text-xs">
                                            <div>{fmtDate(entry.date)}</div>
                                            <div className="text-xs text-gray-500">{fmtTime(entry.time)}</div>
                                        </div>
                                    </td>
                                    <td className="p-1">{fmtHours(entry.flight_hours)}</td>
                                    <td className="p-1">{fmtHours(entry.ground_hours)}</td>
                                    <td className="p-1 md:table-cell">{fmtHours(entry.sim_hours)}</td>
                                    <td className="p-1 md:table-cell">{fmtHours(entry.admin_hours)}</td>
                                    <td className="p-1 sm:table-cell">{fmtName(entry.customer)}</td>
                                    <td className="p-0 sm:table-cell">{entry.ride_count}</td>
                                    <td className="p-1 hidden lg:table-cell max-w-xs truncate">{entry.notes || '-'}</td>
                                    <td className="p-1 xs:table-cell xs:text-right">
                                        <Button variant="destructive" size="icon" onClick={() => onDeleteEntry(Number(entry.id))}>
                                            ❌
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}