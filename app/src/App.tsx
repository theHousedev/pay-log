// App.tsx
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import MainForm from '@/components/Form'
import AuthGuard from '@/components/AuthGuard'
import LoginForm from '@/components/LoginForm'
import { usePayPeriod } from '@/hooks/usePayPeriod'
import { useEntryForm } from '@/hooks/useEntryForm'
import { useViewTotals } from '@/hooks/useViewTotals'
import { useEntryManager } from '@/hooks/useEntryManager'

import type { ViewType } from '@/types'

function App() {
  const { payPeriod, calculateEntryValue, refreshPayPeriod } = usePayPeriod();
  const { viewTotals, fetchViewTotals } = useViewTotals();
  const [view, setView] = useState<ViewType>('period');
  const {
    entryData,
    handleFieldChange,
    handleFormChange,
    setFormData } = useEntryForm();
  const {
    isEditMode,
    entries,
    entriesLoading,
    fetchEntries,
    handleEditEntry,
    handleSubmitEntry,
    handleDeleteEntry
  } = useEntryManager(view, entryData, setFormData, refreshPayPeriod);

  const handleViewChange = (newView: ViewType, date?: string) => {
    setView(newView)
    fetchEntries(newView, date);
    fetchViewTotals(newView, date);
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
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              viewTotals={viewTotals ?? {
                flight_hours: 0,
                ground_hours: 0,
                sim_hours: 0,
                admin_hours: 0,
                all_hours: 0,
                gross: 0,
              }}
              isEditMode={isEditMode}
            />
          </AuthGuard>} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;