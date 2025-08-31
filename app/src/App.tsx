import { useState, useEffect } from 'react'
import './styles.css'

type EntryType = 'flight' | 'ground' | 'admin' | 'misc'

interface EntryForm {
  date: string
  time: string
  flightHours: number | null
  groundHours: number | null
  hours: number | null
  customerName: string
  notes: string
  entryType: EntryType
}

interface CurrentCheck {
  date: string
  flight: number
  total: number
  gross: number
  remaining: number
}

function App() {
  const [formData, setFormData] = useState<EntryForm>({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    flightHours: null,
    groundHours: null,
    hours: null,
    customerName: '',
    notes: '',
    entryType: 'flight'
  })

  const [currentCheck, setCurrentCheck] = useState<CurrentCheck>({
    date: '05SEP2025',
    flight: 19.3,
    total: 33.1,
    gross: 982.73,
    remaining: 1.8
  })

  useEffect(() => {
    const calculateRemaining = () => {
      // TODO: pull past 24hrs from backend
      const past24Hours = 6.2
      const remaining = Math.max(0, 8.0 - past24Hours)

      setCurrentCheck(prev => ({
        ...prev,
        remaining: Math.round(remaining * 10) / 10
      }))
    }

    calculateRemaining()
  }, [formData.date, formData.time])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Entry submitted: ', formData)
    // TODO: interact with backend
  }

  const handleChange = (field: keyof EntryForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNumberChange = (field: keyof EntryForm, value: string) => {
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
              onClick={() => handleChange('entryType', type)}
              className={formData.entryType === type ? 'button activeButton' : 'button inactiveButton'}
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
                max="8"
                value={formData.flightHours ?? ''}
                onChange={(e) => handleNumberChange('flightHours', e.target.value)}
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
                value={formData.groundHours ?? ''}
                onChange={(e) => handleNumberChange('groundHours', e.target.value)}
                className="hoursInput"
              />
            </div>
            <div>
              <label className="label" style={{ textAlign: 'left' }}>Customer</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
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
                <span>{currentCheck.date}</span>
              </div>
              <div className="currentCheckRow">
                <span>Flight:</span>
                <span>{currentCheck.flight}</span>
              </div>
              <div className="currentCheckRow">
                <span>Total:</span>
                <span>{currentCheck.total}</span>
              </div>
              <div className="currentCheckRow">
                <span>Gross:</span>
                <span>$ {currentCheck.gross.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Remaining Time and Submit */}
          <div className="remainingSection">
            <div className="remainingText" style={{
              color: currentCheck.remaining < 2 ? '#f87171' : '#a9b1d6',
              fontSize: '14px',
            }}>
              Remaining: {currentCheck.remaining}hrs
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="submitButton"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Debug Info */}
        <div className="debugInfo">
          <p>DEBUG INFO</p>
          <p>Current Entry Type: {formData.entryType}</p>
          <p>Date: {formData.date}</p>
          {formData.entryType === 'flight' ? (
            <>
              <p>Flight Hours: {formData.flightHours ?? 'empty'}</p>
              <p>Ground Hours: {formData.groundHours ?? 'empty'}</p>
            </>
          ) : (
            <p>Hours: {formData.hours ?? 'empty'}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App