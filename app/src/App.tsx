import { useState, useEffect } from 'react'
import './styles.css'

type EntryType = 'flight' | 'ground' | 'admin' | 'misc'

interface Entry {
  type: EntryType
  date: string
  time: string
  flight_hours: number | null
  ground_hours: number | null
  sim_hours: number | null
  admin_hours: number | null
  customer: string
  notes: string
  ride_count: number | null
  meeting: boolean
}

interface PayPeriod {
  date: string
  flight_hours: number
  ground_hours: number
  sim_hours: number
  admin_hours: number
  all_hours: number
  gross: number
  remaining: number
}

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

  const backendPort = (globalThis as any).BACKEND_PORT;
  const backendPath = `http://localhost:${backendPort}/api`;

  useEffect(() => {
    const calculateRemaining = () => {
      // TODO: pull past 24hrs from backend
      const past24Hours = 6.2
      const remaining = Math.max(0, 8.0 - past24Hours)

      setPayPeriod(prev => ({
        ...prev,
        remaining: Math.round(remaining * 10) / 10
      }))
    }

    calculateRemaining()
  }, [formData.date, formData.time])

  const handleSubmit = async (event: React.FormEvent) => {
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

  const handleChange = (field: keyof Entry, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNumberChange = (field: keyof Entry, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    setFormData(prev => ({ ...prev, [field]: numValue }))
  }

  return (
    <div className="container">
      <div className="contentWrapper">
        {/* Entry Type Buttons - Top Navigation */}
        <div className="buttonRow">
          {(['flight', 'ground', 'admin', 'misc'] as EntryType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('type', type)}
              className={formData.type === type ?
                'button activeButton' : 'button inactiveButton'}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Entry Form */}
        <div className="formSection">
          {/* Row 1: Flight, Time, Date */}
          <label className="label" style={{ textAlign: 'left' }}>Flight</label>
          <div className="row1">
            <div>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                max="8.0"
                value={formData.flight_hours ?? ''}
                onChange={(e) => handleNumberChange('flight_hours', e.target.value)}
                className="hoursInput"
              />
            </div>
            <div>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className="timeInput"
              />
            </div>
            <div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="dateInput"
              />
            </div>
          </div>

          {/* Row 2: Ground, Customer */}
          <div className="row2">
            <div>
              <label className="label" style={{ textAlign: 'left' }}>Ground</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                max="2"
                value={formData.ground_hours ?? ''}
                onChange={(e) => handleNumberChange('ground_hours', e.target.value)}
                className="hoursInput"
              />
            </div>
            <div>
              <label className="label" style={{ textAlign: 'left' }}>Customer</label>
              <input
                type="text"
                value={formData.customer}
                onChange={(e) => handleChange('customer', e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Row 3: Notes */}
          <div>
            <label className="label" style={{ textAlign: 'left' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="textarea"
            />
          </div>
        </div>

        {/* Current Check Section - Shared Row */}
        <div className="currentCheckSection">
          {/* Current Check Box */}
          <div className="currentCheckBox">
            <h2 className="currentCheckTitle">Current Check</h2>
            <div style={{ fontSize: '16px', fontFamily: 'monospace' }}>
              <div className="currentCheckRow">
                <span>Date:</span>
                <span>{payPeriod.date}</span>
              </div>
              <div className="currentCheckRow">
                <span>Flight:</span>
                <span>{payPeriod.flight_hours}</span>
              </div>
              <div className="currentCheckRow">
                <span>Ground:</span>
                <span>{payPeriod.ground_hours}</span>
              </div>
              <div className="currentCheckRow">
                <span>Sim:</span>
                <span>{payPeriod.sim_hours}</span>
              </div>
              <div className="currentCheckRow">
                <span>Admin:</span>
                <span>{payPeriod.admin_hours}</span>
              </div>
              <div className="currentCheckRow">
                <span>Total Hours:</span>
                <span>{payPeriod.all_hours}</span>
              </div>
              <div className="currentCheckRow">
                <span>Gross Pay:</span>
                <span>$ {payPeriod.gross.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Remaining Time and Submit */}
          <div className="remainingSection">
            <div className="remainingText" style={{
              color: payPeriod.remaining < 2 ? '#f87171' : '#a9b1d6',
              fontSize: '14px',
            }}>
              Remaining: {payPeriod.remaining}hrs
            </div>
            <button type="submit" onClick={handleSubmit} className="submitButton">
              Submit
            </button>
          </div>
        </div>

        {/* Debug Info */}
        {/* <div className="debugInfo">
          <p>DEBUG INFO</p>
          <p>Current Entry Type: {formData.type}</p>
          <p>Date: {formData.date}</p>
          {formData.type === 'flight' ? (
            <>
              <p>Flight Hours: {formData.flight_hours ?? 'empty'}</p>
              <p>Ground Hours: {formData.ground_hours ?? 'empty'}</p>
            </>
          ) : (
            <p>Hours: {formData.admin_hours ?? 'empty'}</p>
          )}
        </div> */}
      </div>
    </div>
  )
}

export default App