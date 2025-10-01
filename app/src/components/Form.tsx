import { format } from "date-fns"
import { useState } from "react"

// shadcn
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

// custom imports
import type { Entry, EntryType, PayPeriod, ViewType, ViewTotals, HistPayPeriod } from "@/types"
import FormSelector from "@/components/FormSelector"
import InputTypes from "@/components/inputTypes"
import ViewSelector from "@/components/ViewSelector"
import EntriesTable from "@/components/EntriesTable"
import { formatDateRange } from "@/utils/frontend"
import DaySelector from "@/components/DaySelector"

interface FormProps {
    input: Entry;
    onFieldChange: (field: keyof Entry, value: string | number) => void;
    onFormChange: (type: EntryType) => void;
    onSubmitEntry: (event: React.FormEvent) => void;
    entryValue?: number;
    payPeriod: PayPeriod;
    view: ViewType;
    onViewChange: (view: ViewType, date?: string) => void;
    entries: Entry[];
    entriesLoading: boolean;
    onDeleteEntry: (id: string) => void;
    onEditEntry: (id: string) => void;
    viewTotals: ViewTotals;
    isEditMode: boolean;
    allPeriods?: HistPayPeriod[];
    selectedPeriodID?: number | null;
    setSelectedPeriodID?: (id: number | null) => void;
    selectedPeriod?: HistPayPeriod;
}

function MainForm({
    input,
    onFieldChange,
    onFormChange,
    onSubmitEntry,
    entryValue = 0,
    payPeriod,
    view,
    onViewChange,
    entries,
    entriesLoading,
    onDeleteEntry,
    onEditEntry,
    viewTotals,
    isEditMode,
    allPeriods,
    selectedPeriodID,
    selectedPeriod,
    setSelectedPeriodID,
}: FormProps) {
    const [selectedDate, setSelectedDate] = useState(() => {
        return new Date().toISOString().split('T')[0]
    })

    const handleDateChange = (date: string) => {
        setSelectedDate(date)
        if (view === 'day') {
            onViewChange('day', date)
        }
    }

    const displayPeriod = selectedPeriod ? {
        start: selectedPeriod.start,
        end: selectedPeriod.end,
        all_hours: selectedPeriod.total_hours,
        gross: selectedPeriod.gross_earnings,
        flight_hours: 0,
        ground_hours: 0,
        sim_hours: 0,
        admin_hours: 0,
        remaining: 0
    } : payPeriod;

    return (
        <div className="flex justify-center items-center mt-1.5">
            <Card className="w-full max-w-4xl border-none bg-transparent" id="main-form"
                style={{
                    borderRadius: '21px',
                }}>
                <CardContent className="p-2 space-y-6">
                    <div className="display-flex height-20px flex-row">
                        <FormSelector
                            formData={input}
                            onFormChange={onFormChange}
                        />

                        <div className="flex gap-2 mb-2">
                            <Button
                                id="reset-time-date"
                                className="opacity-50"
                                style={{ width: '50px' }}
                                onClick={() => {
                                    onFieldChange('time', format(new Date(Date.now()), 'HH:mm'));
                                    onFieldChange('date', new Date().toLocaleDateString("en-CA"));
                                }}>Reset</Button>
                            <Input id="time" type="time" tabIndex={0} style={{ width: '45%' }}
                                value={input.time}
                                onChange={(e) => onFieldChange('time', e.target.value)}
                            />
                            <DaySelector
                                selectedDate={input.date}
                                onDateChange={(date) => onFieldChange('date', date)}
                            />
                        </div>

                        <InputTypes
                            entry={input}
                            onFieldChange={onFieldChange}
                        />

                        <div className="flex gap-2 items-end">
                            <div className="grid grid-cols-1 gap-2" style={{ width: '100%' }}>
                                <Label className="font-bold">Notes</Label>
                                <Textarea className="resize-none" rows={2} tabIndex={4}
                                    value={input.notes ?? ''}
                                    onChange={(e) => onFieldChange('notes', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-2" style={{ width: '25%' }}>
                                {entryValue > 0 && (
                                    <div className="text-sm text-foreground text-center">
                                        ${entryValue.toFixed(2)}
                                    </div>
                                )}
                                <Button id="submit-entry" className="h-16"
                                    onClick={(e) => {
                                        onSubmitEntry(e);
                                    }}
                                >{isEditMode ? 'Update' : 'Submit'}</Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-muted/50 rounded-lg p-4" style={{ width: '50%' }}>
                            <div className="text-sm text-muted-foreground mb-2">
                                {(() => {
                                    return formatDateRange(displayPeriod.start, displayPeriod.end);
                                })()}
                            </div>
                            <div className="text-md font-semibold mb-2">
                                {displayPeriod.all_hours.toFixed(1).padStart(4, ' ')} -
                                ${displayPeriod.gross.toFixed(2).padStart(6, ' ')}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div>F: {displayPeriod.flight_hours.toFixed(1)}</div>
                                    <div>G: {displayPeriod.ground_hours.toFixed(1)}</div>
                                </div>
                                <div>
                                    <div>S: {displayPeriod.sim_hours.toFixed(1)}</div>
                                    <div>A: {displayPeriod.admin_hours.toFixed(1)}</div>
                                </div>
                            </div>
                            {displayPeriod.remaining > 0 && (
                                <div className="text-xs text-muted-foreground mt-2">
                                    Remaining: {displayPeriod.remaining.toFixed(1)}h
                                </div>
                            )}
                        </div>

                        {/* View Totals - Only when view is not 'period' */}
                        {view !== 'period' && viewTotals && (
                            <div className="bg-muted/50 rounded-lg p-4" style={{ width: '50%' }}>
                                <div className="text-sm text-muted-foreground mb-2">
                                    {view === 'day' ? 'Today' : view === 'week' ? 'Week' : 'All Time'}
                                </div>
                                <div className="text-md font-semibold mb-2">
                                    {viewTotals.all_hours.toFixed(1).padStart(4, ' ')} -
                                    ${viewTotals.gross.toFixed(2).padStart(6, ' ')}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div>F: {viewTotals.flight_hours.toFixed(1)}</div>
                                        <div>G: {viewTotals.ground_hours.toFixed(1)}</div>
                                    </div>
                                    <div>
                                        <div>S: {viewTotals.sim_hours.toFixed(1)}</div>
                                        <div>A: {viewTotals.admin_hours.toFixed(1)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <ViewSelector
                                view={view}
                                onViewChange={onViewChange}
                                selectedDate={selectedDate}
                                onDateChange={handleDateChange}
                                allPeriods={allPeriods ?? []}
                                selectedPeriodID={selectedPeriodID ?? null}
                                setSelectedPeriodID={setSelectedPeriodID ?? (() => { })}
                            />
                        </div>
                        <EntriesTable
                            entries={entries}
                            isLoading={entriesLoading}
                            onDeleteEntry={onDeleteEntry}
                            onEditEntry={onEditEntry}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default MainForm;