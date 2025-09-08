import { useState, useEffect } from 'react'

import type { Entry, EntryType, PayPeriod } from './types'
import Form from '@/components/form'
import CurrentCheck from '@/components/CurrentCheck'

function resetForm(currentEntry: Entry): Entry {

  return {
    type: currentEntry.type,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    flight_hours: null,
    ground_hours: null,
    sim_hours: null,
    admin_hours: null,
    customer: '',
    notes: '',
    ride_count: null,
    meeting: false
  };
}

function App() {
  const [entryData, setEntryData] = useState<Entry>({
    type: 'flight',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    flight_hours: null,
    ground_hours: null,
    sim_hours: null,
    admin_hours: null,
    customer: '',
    notes: '',
    ride_count: null,
    meeting: false
  })

  const [payPeriod, setPayPeriod] = useState<PayPeriod>({
    start: '01SEP2025',
    end: '14SEP2025',
    flight_hours: 19.3,
    ground_hours: 13.8,
    sim_hours: 0,
    admin_hours: 0,
    all_hours: 33.1,
    gross: 982.73,
    remaining: 1.8
  })

  const backendPort = (globalThis as any).BACKEND_PORT;
  const backendPath = `http://localhost:${backendPort}/api`;

  useEffect(() => {
    const calculateRemaining = () => {
      const dualGivenIn24 = 6.2 // TODO: calculate past 24hrs from backend
      const remaining = Math.max(0, 8.0 - dualGivenIn24)

      setPayPeriod(prev => ({
        ...prev,
        remaining: Math.round(remaining * 10) / 10
      }))
    }

    calculateRemaining()
  }, [entryData.date, entryData.time])

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
    } catch (error) {
      console.error('Error: ', error);
    }
    setEntryData(resetForm(entryData))
  };

  const handleFieldChange = (field: keyof Entry, value: string | number) => {
    let convertedValue: string | number | null = value;

    if (field === 'flight_hours' || field === 'ground_hours' ||
      field === 'sim_hours' || field === 'admin_hours' || field === 'ride_count') {
      convertedValue = value === '' ? null : parseFloat(value as string);
    }

    setEntryData(prev => ({ ...prev, [field]: convertedValue }))
  }

  const handleFormChange = (type: EntryType) => {
    setEntryData(resetForm(entryData))
    setEntryData(prev => ({ ...prev, type: type }))
  }

  return (
    <div className="container">
      <div className="contentWrapper">
        <Form
          input={entryData}
          onFieldChange={handleFieldChange}
          onFormChange={handleFormChange}
          onSubmitEntry={handleSubmitEntry} />
        <CurrentCheck payPeriod={payPeriod} />
        {/*
          TODO: bottom of form can be conditional past 24hrs warning
        */}
      </div>
    </div>
    // TODO: confirmation of entry submission; possible timeout?
    // TODO: remaining 
  )
}

export default App