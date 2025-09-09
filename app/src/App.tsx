import { useEffect, useState } from 'react'
import MainForm from '@/components/Form'
import AuthGuard from '@/components/AuthGuard'
import Display from '@/components/Display'
import { usePayPeriod } from '@/hooks/usePayPeriod'
import { useEntryForm } from '@/hooks/useEntryForm'
import { getBackendPath } from '@/utils/backend'
import type { ViewType } from '@/types'


function App() {
  const { entryData, resetEntryForm, handleFieldChange, handleFormChange } = useEntryForm();
  const { payPeriod, fetchPayPeriod, calculateEntryValue, refreshPayPeriod, isLoading } = usePayPeriod();
  const backendPath = getBackendPath();
  const [view, setView] = useState<ViewType>('period');

  useEffect(() => {
    fetchPayPeriod();
  }, []);

  const handleSubmitEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Form data sent:', entryData)
    try {
      const response = await fetch(`${backendPath}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
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
          />
          <Display
            payPeriod={payPeriod}
            isLoading={isLoading}
            view={view}
            onViewChange={setView}
          />
          {/*
            TODO: bottom of form can be conditional past 24hrs warning
          */}
        </div>
      </div>
      {/* 
        TODO: confirmation of entry submission; possible timeout?
        TODO: remaining hours in 24hr period
      */}
    </AuthGuard>
  )
}

export default App;