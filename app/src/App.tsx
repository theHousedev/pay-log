import { useEffect, useState } from 'react'
import MainForm from '@/components/Form'
import AuthGuard from '@/components/AuthGuard'
import { useEntries } from '@/hooks/useEntries'
import { usePayPeriod } from '@/hooks/usePayPeriod'
import { useEntryForm } from '@/hooks/useEntryForm'
import { getAPIPath } from '@/utils/backend'
import type { ViewType } from '@/types'


function App() {
  const { entryData, resetEntryForm, handleFieldChange, handleFormChange } = useEntryForm();
  const { payPeriod, fetchPayPeriod, calculateEntryValue, refreshPayPeriod, isLoading } = usePayPeriod();
  const { entries, fetchEntries, isLoading: entriesLoading } = useEntries();
  const apiPath = getAPIPath();
  const [view, setView] = useState<ViewType>('period');

  useEffect(() => {
    fetchPayPeriod();
    fetchEntries('period');
  }, []);

  const handleSubmitEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const { id, ...entryDataWithoutId } = entryData;

    try {
      const response = await fetch(`${apiPath}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryDataWithoutId)
      });
      const result = await response.json();

      if (result.status === 'OK') {
        console.log(result.message, result.data.entry_id);
        await fetchEntries(view);
        await refreshPayPeriod();
      }
    } catch (error) {
      console.error('Error: ', error);
    }

    resetEntryForm(entryData);
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView)
    fetchEntries(newView);
  }

  const handleDeleteEntry = async (id: number) => {
    const confirmed = window.confirm('Confirm deletion of entry');
    if (!confirmed) return;
    deleteAsync(id);
  }

  const deleteAsync = async (id: number) => {
    try {
      const response = await fetch(`${apiPath}/delete?id=${id}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.status === 'OK') {
        console.log(result.message, result.data.entry_id);
        await fetchEntries(view);
        await refreshPayPeriod();
      } else {
        alert(`Failed to delete entry: ${result.message}`);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  }

  return (
    <AuthGuard>
      <div className="container">
        <div className="contentWrapper">
          <MainForm
            input={entryData}
            onFieldChange={handleFieldChange}
            onFormChange={handleFormChange}
            onSubmitEntry={handleSubmitEntry}
            entryValue={calculateEntryValue(entryData)}
            payPeriod={payPeriod}
            isLoading={isLoading}
            view={view}
            onViewChange={handleViewChange}
            entries={entries}
            entriesLoading={entriesLoading}
            onDeleteEntry={handleDeleteEntry}
          />
        </div>
      </div>
    </AuthGuard>
  )
}

export default App;