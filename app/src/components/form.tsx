import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import type { Entry } from "@/types"

interface FormProps {
    input: Entry;
    onFieldChange: (field: keyof Entry, value: string | number) => void;
    onNumberChange: (field: keyof Entry, value: string) => void;
}

function Form({ input, onFieldChange, onNumberChange }: FormProps) {
    return (
        <Card className="w-full">
            <CardContent className="space-y-4 p-6">
                {/* Row 1: Flight, Time, Date */}
                <div className="space-y-2">
                    <Label htmlFor="flight-hours">Flight Hours</Label>
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            id="flight-hours"
                            type="number"
                            step="0.1"
                            min="0"
                            max="10.0"
                            value={input.flight_hours ?? ''}
                            onChange={(e) => onNumberChange('flight_hours', e.target.value)}
                        />
                        <Input
                            type="time"
                            value={input.time}
                            onChange={(e) => onFieldChange('time', e.target.value)}
                        />
                        <Input
                            type="date"
                            value={input.date}
                            onChange={(e) => onFieldChange('date', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 2: Ground, Customer */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="ground-hours">Ground Hours</Label>
                        <Input
                            id="ground-hours"
                            type="number"
                            step="0.1"
                            min="0"
                            max="10.0"
                            value={input.ground_hours ?? ''}
                            onChange={(e) => onNumberChange('ground_hours', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Input
                            id="customer"
                            type="text"
                            value={input.customer}
                            onChange={(e) => onFieldChange('customer', e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 3: Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        value={input.notes}
                        onChange={(e) => onFieldChange('notes', e.target.value)}
                        rows={2}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default Form;