import { Button } from "@/components/ui/button"
import DaySelector from "./DaySelector"
import type { HistPayPeriod, ViewType } from "@/types"
import { PeriodSelector } from "./PeriodSelector";

interface ViewTypeProps {
    view: ViewType;
    onViewChange: (type: ViewType) => void;
    selectedDate?: string;
    onDateChange?: (date: string) => void;
    allPeriods: HistPayPeriod[];
    selectedPeriodID: number | null;
    setSelectedPeriodID: (id: number | null) => void;
}

export default function ViewSelector({
    view,
    onViewChange,
    selectedDate,
    onDateChange,
    allPeriods,
    selectedPeriodID,
    setSelectedPeriodID
}: ViewTypeProps) {
    return (
        <div className="space-y-2">
            <div
                className="buttonRow"
                id="view-selector"
                style={{
                    display: 'flex',
                    height: '20px',
                    flexDirection: 'row',
                    gap: '5px',
                    marginLeft: '5px',
                    marginBottom: '5px',
                    marginTop: '0px',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                {(['period', 'day', 'week', 'all'] as ViewType[]).map(type => (
                    <Button
                        key={type}
                        style={{
                            height: '30px',
                            width: '65px',
                        }}
                        variant={view === type ? "default" : "outline"}
                        className={view === type ? "opacity-75" : "opacity-50"}
                        onClick={() => onViewChange(type)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                ))}

                {view === 'day' && selectedDate && onDateChange && (
                    <DaySelector
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                    />
                )}
            </div>
            {view === 'period' && allPeriods && (
                <div className="mt-2">
                    <PeriodSelector
                        allPeriods={allPeriods}
                        selectedID={selectedPeriodID}
                        setSelectedID={setSelectedPeriodID}
                    />
                </div>
            )}


        </div>
    )
}