import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Entry } from "@/types";

interface EntriesTableProps {
    entries: Entry[];
    isLoading: boolean;
    onDeleteEntry: (id: number) => void;
}

export default function EntriesTable({ entries, isLoading, onDeleteEntry }: EntriesTableProps) {
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card className="w-full mb-4">
                <CardContent className="p-4">
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
                <CardContent className="p-4">
                    <div className="text-center text-muted-foreground">
                        No entries for this period.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full mb-4">
            <CardHeader>
                <CardTitle>Entries</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-2">Date</th>
                                <th className="text-left p-2">Time</th>
                                <th className="text-left p-2">F</th>
                                <th className="text-left p-2">G</th>
                                <th className="text-left p-2">S</th>
                                <th className="text-left p-2">A</th>
                                <th className="text-left p-2">Customer</th>
                                <th className="text-left p-2">Notes</th>
                                <th className="text-left p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{formatDate(entry.date)}</td>
                                    <td className="p-2">{formatTime(entry.time)}</td>
                                    <td className="p-2">{entry.flight_hours || '-'}h</td>
                                    <td className="p-2">{entry.ground_hours || '-'}h</td>
                                    <td className="p-2">{entry.sim_hours || '-'}h</td>
                                    <td className="p-2">{entry.admin_hours || '-'}h</td>
                                    <td className="p-2">{entry.customer || '-'}</td>
                                    <td className="p-2 max-w-xs truncate">{entry.notes || '-'}</td>
                                    <td className="p-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDeleteEntry(parseInt(entry.id))}
                                        >
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