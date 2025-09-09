import { Button } from "@/components/ui/button"
import type { ViewType } from "@/types"

interface ViewTypeProps {
    view: ViewType;
    onViewChange: (type: ViewType) => void;
}

export default function ViewSelector({ view, onViewChange }: ViewTypeProps) {
    return (
        <div
            className="buttonRow"
            id="view-selector"
            style={{
                display: 'flex',
                height: '20px',
                flexDirection: 'row',
                gap: '4px',
                marginBottom: '5px',
                marginTop: '0px',
                justifyContent: 'center'
            }}>
            {(['period', 'day', 'week', 'all'] as ViewType[]).map(type => (
                <Button
                    key={type}
                    style={{
                        height: '25px'
                    }}
                    variant={view === type ? "default" : "outline"}
                    className={view === type ? "opacity-75" : "opacity-50"}
                    onClick={() => onViewChange(type)}
                >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
            ))}
        </div>
    )
}