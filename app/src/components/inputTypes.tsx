import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

// custom imports
import type { Entry, EntryType } from "@/types";


interface InputTypesProps {
    entry: Entry;
    onFieldChange: (field: keyof Entry, value: string | number) => void;
}

export default function InputTypes({ entry, onFieldChange }: InputTypesProps) {
    const [rideCountEnabled, setRideCountEnabled] = useState(false);
    switch (entry.type as EntryType) {
        case 'flight':
            return (
                <>
                    <div className="flex gap-2 mb-3">
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="flight-hours" className="font-bold">Flight</Label>
                            <Input id="flight-hours" type="number" inputMode="decimal" tabIndex={1}
                                min="0" step="0.1" placeholder="0.0"
                                value={entry.flight_hours ?? ''}
                                onChange={(e) => onFieldChange('flight_hours', e.target.value)}
                            />
                        </div>
                        <Separator orientation="vertical" />
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="ground-hours" className="font-bold">Ground</Label>
                            <Input id="ground-hours" type="number" inputMode="decimal" tabIndex={2}
                                min="0" step="0.1" placeholder="0.0"
                                value={entry.ground_hours ?? ''}
                                onChange={(e) => onFieldChange('ground_hours', e.target.value)}
                            />
                        </div>
                        <Separator orientation="vertical" />
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="customer" className="font-bold">Customer</Label>
                            <Input id="customer" type="text"
                                value={entry.customer ?? ''}
                                onChange={(e) => onFieldChange('customer', e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )
        case 'sim':
            return (
                <>
                    <div className="flex gap-2 mb-3">
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="sim-hours" className="font-bold">Sim</Label>
                            <Input id="sim-hours" type="number" inputMode="decimal" tabIndex={1}
                                min="0" step="0.1" placeholder="0.0"
                                value={entry.sim_hours ?? ''}
                                onChange={(e) => onFieldChange('sim_hours', e.target.value)}
                            />
                        </div>
                        <Separator orientation="vertical" />
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="ground-hours" className="font-bold">Ground</Label>
                            <Input id="ground-hours" type="number" inputMode="decimal" tabIndex={2}
                                min="0" step="0.1" placeholder="0.0"
                                value={entry.ground_hours ?? ''}
                                onChange={(e) => onFieldChange('ground_hours', e.target.value)}
                            />
                        </div>
                        <Separator orientation="vertical" />
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="customer" className="font-bold">Customer</Label>
                            <Input id="customer" type="text"
                                value={entry.customer ?? ''}
                                onChange={(e) => onFieldChange('customer', e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )
        case 'ground':
            return (
                <>
                    <div className="flex gap-2 mb-3">
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="ground-hours" className="font-bold">Ground</Label>
                            <Input id="ground-hours" type="number" inputMode="decimal" tabIndex={2}
                                min="0" step="0.1" placeholder="0.0"
                                value={entry.ground_hours ?? ''}
                                onChange={(e) => onFieldChange('ground_hours', e.target.value)}
                            />
                        </div>
                        <Separator orientation="vertical" />
                        <div className="grid grid-cols-1 gap-2">
                            <Label htmlFor="customer" className="font-bold">Customer</Label>
                            <Input id="customer" type="text"
                                value={entry.customer ?? ''}
                                onChange={(e) => onFieldChange('customer', e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )
        case 'admin':
            return (
                <>
                    <div className="flex gap-2 mb-3">
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="admin-hours" className="font-bold">Admin</Label>
                            <Input id="admin-hours" type="number" inputMode="decimal" tabIndex={2}
                                min="0" step="0.1" placeholder="0.0"
                                disabled={rideCountEnabled}
                                value={entry.admin_hours ?? ''}
                                onChange={(e) => onFieldChange('admin_hours', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-5" style={{ width: '25%', justifyItems: 'center' }}>
                            <Label htmlFor="ride-count-switch" className="font-bold">Rides</Label>
                            <Switch id="ride-count-switch" style={{ scale: '1.7' }} checked={rideCountEnabled}
                                onCheckedChange={(checked) => setRideCountEnabled(checked)} />
                        </div>
                        <div className="grid grid-cols-1 gap-2" style={{ width: '15%' }}>
                            <Label htmlFor="ride-count" className="font-bold">Count</Label>
                            <Input id="ride-count" type="number" inputMode="numeric" tabIndex={2}
                                min="0" step="1" placeholder="0"
                                disabled={!rideCountEnabled}
                                value={entry.ride_count ?? ''}
                                onChange={(e) => onFieldChange('ride_count', e.target.value)}
                            />
                        </div>

                    </div>
                </>
            )
        default:
            return (
                <>
                    <Label htmlFor="misc-hours" className="font-bold" style={{ fontSize: '1.5rem' }}>TODO</Label>
                </>
            )
    }
}