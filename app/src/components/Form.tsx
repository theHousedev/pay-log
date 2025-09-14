import { format } from "date-fns"

// shadcn
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"

// custom imports
import type { Entry, EntryType, PayPeriod, ViewType } from "@/types"
import FormSelector from "@/components/FormSelector"
import InputTypes from "@/components/inputTypes"
import ViewSelector from "@/components/ViewSelector"
import EntriesTable from "@/components/EntriesTable"
import { formatDateRange } from "@/utils/frontend"

interface FormProps {
    input: Entry;
    onFieldChange: (field: keyof Entry, value: string | number) => void;
    onFormChange: (type: EntryType) => void;
    onSubmitEntry: (event: React.FormEvent) => void;
    entryValue?: number;
    payPeriod: PayPeriod;
    view: ViewType;
    onViewChange: (view: ViewType) => void;
    entries: Entry[];
    entriesLoading: boolean;
    onDeleteEntry: (id: number) => void;
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
    onDeleteEntry }: FormProps) {
    return (
        <div className="flex justify-center items-center mt-1.5">
            <Card className="w-full max-w-4xl border-none bg-transparent" id="main-form"
                style={{
                    borderRadius: '21px',
                }}>
                <CardContent className="p-2 space-y-6">
                    <div className="space-y-0">
                        <FormSelector
                            formData={input}
                            onFormChange={onFormChange}
                        />

                        <div className="flex gap-2 mb-2">
                            <Input id="time" type="time" tabIndex={0} style={{ width: '45%' }}
                                value={input.time}
                                onChange={(e) => onFieldChange('time', e.target.value)}
                            />
                            <Input id="date" type="date" tabIndex={1} style={{ width: '75%' }}
                                value={input.date}
                                onChange={(e) => onFieldChange('date', e.target.value)}
                            />
                            <Button id="reset-time-date" className="w-25%" onClick={() => {
                                onFieldChange('time', format(new Date(Date.now()), 'HH:mm'));
                                onFieldChange('date', new Date().toLocaleDateString("en-CA"));
                            }}>Reset</Button>
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
                                    onClick={onSubmitEntry}
                                >Submit</Button>
                            </div>
                        </div>
                    </div>

                    {/* Pay Period Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-2">
                            {formatDateRange(payPeriod.start, payPeriod.end)}
                        </div>
                        <div className="flex gap-6 text-sm">
                            <div>
                                <h3 className="font-semibold mb-1">Hours</h3>
                                <div className="space-y-0.5">
                                    <div>F: {payPeriod.flight_hours.toFixed(1)}</div>
                                    <div>G: {payPeriod.ground_hours.toFixed(1)}</div>
                                    <div>S: {payPeriod.sim_hours.toFixed(1)}</div>
                                    <div>A: {payPeriod.admin_hours.toFixed(1)}</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Earned</h3>
                                <div className="space-y-0.5">
                                    <div>Total: {payPeriod.all_hours.toFixed(1)}h</div>
                                    <div>Gross: ${payPeriod.gross.toFixed(2)}</div>
                                    {payPeriod.remaining > 0 && (
                                        <div>Remaining: {payPeriod.remaining.toFixed(1)}h</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Entries Table */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <ViewSelector view={view} onViewChange={onViewChange} />
                        </div>
                        <EntriesTable
                            entries={entries}
                            isLoading={entriesLoading}
                            onDeleteEntry={onDeleteEntry}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default MainForm;