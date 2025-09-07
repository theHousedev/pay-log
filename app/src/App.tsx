import { useState, useEffect } from 'react'

import type { Entry, EntryType, PayPeriod } from './types'
import Form from './components/main-form/form'

function App() {
  const [formData, setFormData] = useState<Entry>({
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
    date: '05SEP2025',
    flight_hours: 19.3,
    ground_hours: 13.8,
    sim_hours: 0,
    admin_hours: 0,
    all_hours: 33.1,
    gross: 982.73,
    remaining: 1.8
  })

  // NOTE: to remove linter warning
  payPeriod.date = "07SEP2025"

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
  }, [formData.date, formData.time])

  const handleSubmitEntry = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('Form data sent:', formData)

    try {
      const response = await fetch(`${backendPath}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      console.log('Backend response:', result);
    } catch (error) {
      console.error('Error: ', error);
    }
  };

  const handleFieldChange = (field: keyof Entry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFormChange = (type: EntryType) => {
    setFormData(prev => ({ ...prev, type: type }))
  }

  return (
    <div className="container">
      <div className="contentWrapper">
        <Form
          input={formData}
          onFieldChange={handleFieldChange}
          onFormChange={handleFormChange}
          onSubmitEntry={handleSubmitEntry} />
      </div>
    </div>
  )
}

export default App