import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainForm from '@/components/Form'
import AuthGuard from '@/components/AuthGuard'
import LoginForm from '@/components/LoginForm'
import { useEntries } from '@/hooks/useEntries'
import { usePayPeriod } from '@/hooks/usePayPeriod'
import { useEntryForm } from '@/hooks/useEntryForm'
import { useAuth } from '@/contexts/AuthContext'
import { getAPIPath } from '@/utils/backend'
import type { Entry, ViewType } from '@/types'

function App() {
  const { entryData, cleanEntry, resetEntryForm, handleFieldChange, handleFormChange } = useEntryForm();
  const { payPeriod, fetchPayPeriod, calculateEntryValue, refreshPayPeriod } = usePayPeriod();
  const { entries, fetchEntries, isLoading: entriesLoading } = useEntries();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const apiPath = getAPIPath();
  const [view, setView] = useState<ViewType>('period');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('App: Authentication complete, making initial API calls');
      fetchPayPeriod();
      fetchEntries('period');
    }
  }, [authLoading, isAuthenticated]);

  const handleSubmitEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    const { id, ...entryDataWithoutId } = entryData;

    try {
      const response = await fetch(`${apiPath}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanEntry(entryDataWithoutId as Entry))
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

    resetEntryForm(cleanEntry(entryData));
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <AuthGuard>
            <MainForm
              input={entryData}
              onFieldChange={handleFieldChange}
              onFormChange={handleFormChange}
              onSubmitEntry={handleSubmitEntry}
              entryValue={calculateEntryValue(entryData)}
              payPeriod={payPeriod}
              view={view}
              onViewChange={handleViewChange}
              entries={entries}
              entriesLoading={entriesLoading}
              onDeleteEntry={handleDeleteEntry}
            />
          </AuthGuard>} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
