CREATE TABLE pay_entries (
    id INTEGER PRIMARY KEY,
    pay_period_id INTEGER,
    type TEXT NOT NULL, -- flight/ground/sim/admin/misc
    date DATE NOT NULL,
    time TIME,
    flight_hours DECIMAL(4,2) DEFAULT NULL,
    ground_hours DECIMAL(4,2) DEFAULT NULL,
    sim_hours DECIMAL(4,2) DEFAULT NULL,
    admin_hours DECIMAL(4,2) DEFAULT NULL,
    customer TEXT,
    notes TEXT,
    ride_count INTEGER DEFAULT NULL,
    meeting BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pay_rates (
    id INTEGER PRIMARY KEY,
    effective_date DATE NOT NULL,
    cfi_rate DECIMAL(6,2) NOT NULL,
    admin_rate DECIMAL(6,2) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pay_periods (
    id INTEGER PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    expected_pay_gross DECIMAL(8,2),
    actual_pay_gross DECIMAL(8,2),
    actual_pay_net DECIMAL(8,2),
    status TEXT DEFAULT 'current',    -- current/past/confirmed/imported
    import_batch_id TEXT,
    last_updated TIMESTAMP DEFAULT NULL,
    UNIQUE(start_date, end_date)
);


CREATE TABLE IF NOT EXISTS monthly_stats (
    id INTEGER PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_flight_hours DECIMAL(6,2),
    total_ground_hours DECIMAL(6,2),
    total_admin_hours DECIMAL(6,2),
    total_gross_pay DECIMAL(8,2),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);