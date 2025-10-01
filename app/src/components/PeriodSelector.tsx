import type { HistPayPeriod } from "@/types";

interface PeriodSelectorProps {
    allPeriods: HistPayPeriod[]
    selectedID: number | null
    setSelectedID: (id: number | null) => void
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
    allPeriods,
    selectedID,
    setSelectedID,
}) => {
    const formatPeriod = (period: HistPayPeriod) => {
        const [year, month, day] = period.end.split('T')[0].split('-').map(Number);
        const endDate = new Date(year, month - 1, day);

        const dayNum = endDate.getDate();
        const monthStr = endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const yearStr = endDate.getFullYear().toString().slice(-2);
        const hours = period.total_hours.toFixed(1);
        const gross = period.gross_earnings.toFixed(2);

        return `${dayNum}${monthStr}${yearStr} (${hours}/$${gross})`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastPeriods = allPeriods.filter(period => {
        const [year, month, day] = period.end.split('T')[0].split('-').map(Number);
        const endDate = new Date(year, month - 1, day);
        endDate.setHours(0, 0, 0, 0);
        return endDate < today;
    });

    return (
        <select
            className="bg-background text-foreground border border-input rounded px-2 py-1"
            value={selectedID ?? ''}
            onChange={(e) => setSelectedID(e.target.value ? Number(e.target.value) : null)}
        >
            <option value="">Current</option>
            {pastPeriods.map((period) => (
                <option key={period.id} value={period.id}>
                    {formatPeriod(period)}
                </option>
            ))}
        </select>
    );
}