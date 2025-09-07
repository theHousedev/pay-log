import { Button } from "@/components/ui/button"
import type { Entry, EntryType } from "@/types"

interface FormTypeProps {
    formData: Entry;
    onFormChange: (type: EntryType) => void;
}

export default function FormSelector({ formData, onFormChange }: FormTypeProps) {
    return (
        <div
            className="buttonRow"
            id="form-selector"
            style={{
                display: 'flex',
                height: '40px',
                flexDirection: 'row',
                gap: '4px',
                marginBottom: '20px',
                marginTop: '0px',
                justifyContent: 'center'
            }}>
            {(['flight', 'ground', 'sim', 'admin', 'misc'] as EntryType[]).map(type => (
                <Button
                    key={type}
                    style={{
                        height: '50px'
                    }}
                    variant={formData.type === type ? "default" : "outline"}
                    className={formData.type === type ? "opacity-75" : "opacity-50"}
                    onClick={() => onFormChange(type)}
                >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
            ))}
        </div>
    )
}