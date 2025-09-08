import { useState, useEffect } from 'react'

import type { Entry, EntryType, PayPeriod } from './types'
import Form from '@/components/form'
import CurrentCheck from '@/components/CurrentCheck'

function resetForm(currentEntry: Entry): Entry {
  return {
    type: currentEntry.type,
    date: currentEntry.date,
    time: currentEntry.time,
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
    start: '',
    end: '',
    flight_hours: 0,
    ground_hours: 0,
    sim_hours: 0,
    admin_hours: 0,
    all_hours: 0,
    gross: 0,
    remaining: 0
  })

  const [isLoading, setIsLoading] = useState(true)
  const [currentRates, setCurrentRates] = useState({ cfi_rate: 26.50, admin_rate: 13.75 })

  const backendPort = (globalThis as any).BACKEND_PORT;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const backendHost = isMobile ? '10.0.0.8' : 'localhost';
  const backendPath = `http://${backendHost}:${backendPort}/api`;

  const fetchCurrentPeriod = async () => {
    try {
      const response = await fetch(`${backendPath}/current-period`);
      const result = await response.json();

      if (result.status === 'OK' && result.data) {
        const { period, totals } = result.data;
        console.log('Backend totals received:', totals);

        setPayPeriod({
          start: period.begin_date,
          end: period.end_date,
          flight_hours: totals.flight_hours || 0,
          ground_hours: totals.ground_hours || 0,
          sim_hours: totals.sim_hours || 0,
          admin_hours: totals.admin_hours || 0,
          ride_hours: totals.ride_hours || 0,
          total_rides: totals.total_rides || 0,
          all_hours: totals.total_hours || 0,
          gross: totals.total_gross || 0,
          remaining: 0 // TODO: calculate remaining hours
        });

        setCurrentRates({
          cfi_rate: totals.cfi_rate || 26.50,
          admin_rate: totals.admin_rate || 13.75
        });
      }
    } catch (error) {
      console.error('Error fetching current period:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPeriod();
  }, []);

  const calculateEntryValue = (entry: Entry): number => {
    const cfiHours = (entry.flight_hours || 0) + (entry.ground_hours || 0) + (entry.sim_hours || 0);
    const rideHours = (entry.ride_count || 0) * 0.2;
    const totalAdminHours = (entry.admin_hours || 0) + rideHours;
    const cfiPay = cfiHours * currentRates.cfi_rate;
    const adminPay = totalAdminHours * currentRates.admin_rate;

    return cfiPay + adminPay;
  };

  const handleSubmitEntry = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('Form data sent:', entryData)
    console.log('Current date from form:', entryData.date)
    console.log('Current time from form:', entryData.time)
    console.log('Current browser timezone offset:', new Date().getTimezoneOffset())

    try {
      const response = await fetch(`${backendPath}/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData)
      });
      const result = await response.json();
      console.log('Backend response:', result);

      if (result.status === 'OK') {
        await fetchCurrentPeriod();
      }
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
          onSubmitEntry={handleSubmitEntry}
          entryValue={calculateEntryValue(entryData)} />
        <CurrentCheck payPeriod={payPeriod} isLoading={isLoading} />
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