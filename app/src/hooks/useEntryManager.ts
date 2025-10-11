import { useState, useEffect } from "react";

import type { Entry, ViewType } from "@/types";
import { useEntries } from "@/hooks/useEntries";
import { useViewTotals } from "@/hooks/useViewTotals";
import { entryService } from "@/services/entryService";
import { useAuth } from "@/contexts/AuthContext";

export const useEntryManager = (
    view: ViewType,
    entryData: Entry,
    setFormData: (data: Entry) => void,
    refreshPayPeriod: () => Promise<void>,
    resetEntryForm: (type: string) => void) => {
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const { entries, fetchEntries, isLoading: entriesLoading } = useEntries();
    const { fetchViewTotals } = useViewTotals();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            fetchEntries('period');
            refreshPayPeriod();
        }
    }, [authLoading, isAuthenticated, fetchEntries, refreshPayPeriod]);

    const handleEditEntry = async (id: string) => {
        const entryToEdit = entries.find(entry => entry.id === id);
        console.log('Editing entry:', entryToEdit);
        if (!entryToEdit) return;

        resetEntryForm(entryData.type);
        setEditingEntry(entryToEdit);
        setIsEditMode(true);

        setTimeout(() => {
            const formData = {
                id: entryToEdit.id,
                type: entryToEdit.type,
                date: entryToEdit.date.split('T')[0],
                time: entryToEdit.time,
                flight_hours: entryToEdit.flight_hours,
                ground_hours: entryToEdit.ground_hours,
                sim_hours: entryToEdit.sim_hours,
                admin_hours: entryToEdit.admin_hours,
                customer: entryToEdit.customer || '',
                notes: entryToEdit.notes || '',
                ride_count: entryToEdit.ride_count,
                meeting: entryToEdit.meeting || false
            };
            setFormData(formData);
        }, 0);
    };

    const handleSubmitEntry = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            let cleanEntryData = { ...entryData };
            if (entryData.type === 'admin' && entryData.ride_count && entryData.ride_count > 0) {
                cleanEntryData = { ...entryData, admin_hours: null };
            }

            let response;
            if (isEditMode && editingEntry) {
                response = await entryService.updateEntry(cleanEntryData);
            } else {
                const { id, ...entryDataWithoutID } = cleanEntryData; // eslint-disable-line
                response = await entryService.createEntry(entryDataWithoutID as Entry);
            }

            const result = response;

            if (result.status === 'OK') {
                await fetchEntries(view);
                await fetchViewTotals(view);
                await refreshPayPeriod();

                setIsEditMode(false);
                setEditingEntry(null);
                resetEntryForm(entryData.type);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        const confirmed = window.confirm('Confirm deletion of entry');
        if (!confirmed) return;
        deleteAsync(id);
    }

    const deleteAsync = async (id: string) => {
        try {
            const result = await entryService.deleteEntry(parseInt(id));

            if (result.status === 'OK') {
                await fetchEntries(view);
                await fetchViewTotals(view);
                await refreshPayPeriod();
            } else {
                alert(`Failed to delete entry: ${result.message}`);
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            alert('Failed to delete entry. Please try again.');
        }
    }

    return {
        editingEntry,
        isEditMode,
        entries,
        entriesLoading,
        fetchEntries,
        handleEditEntry,
        handleSubmitEntry,
        handleDeleteEntry
    };
};