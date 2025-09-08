import { format } from "date-fns"

// shadcn
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// custom imports
import type { Entry, EntryType } from "@/types"
import FormSelector from "@/components/formSelector"
import InputTypes from "@/components/inputTypes"

interface FormProps {
    input: Entry;
    onFieldChange: (field: keyof Entry, value: string | number) => void;
    onFormChange: (type: EntryType) => void;
    onSubmitEntry: (event: React.FormEvent) => void;
    entryValue?: number;
}

function MainForm({ input, onFieldChange, onFormChange, onSubmitEntry, entryValue = 0 }: FormProps) {
    return (
        <div className="flex justify-center items-center mt-1.5">
            <Card className="w-full" id="main-form"
                style={{
                    width: '98%',
                    border: 'none',
                    padding: '2px',
                    borderRadius: '21px',
                }}>
                <CardContent className="space-y-2 p-4">
                    <FormSelector
                        formData={input}
                        onFormChange={onFormChange}
                    />
                    <Separator
                        style={{ margin: '21px 0px 15px 0px' }}
                    />
                    <div className="flex gap-2 mb-3">
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
                            onFieldChange('date', new Date().toISOString().split('T')[0]);
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
                        <div className="grid grid-cols-1 gap-2"
                            style={{ width: '25%' }}>
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
                </CardContent>
            </Card >
        </div>
    )
}

export default MainForm;