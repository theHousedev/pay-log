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

    // Create a copy without the ID field
    const { id, ...entryDataWithoutId } = entryData;

    console.log('Form data sent:', entryDataWithoutId);
    try {
      const response = await fetch(`${apiPath}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryDataWithoutId)
      });
      const result = await response.json();
      console.log('Backend response:', result);

      if (result.status === 'OK') {
        console.log('Entry submitted successfully');
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
          />
        </div>
      </div>
    </AuthGuard>
  )
}

export default App;