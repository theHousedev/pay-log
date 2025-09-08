package database

import (
	"fmt"
	"time"
)

// CleanupPeriodStatuses -
func (db *Database) CleanupPeriodStatuses() error {
	query := `
		SELECT id FROM pay_periods 
		WHERE ? BETWEEN start_date AND end_date 
		ORDER BY start_date DESC 
		LIMIT 1
	`

	var currentPeriodID int
	today := time.Now().Format("2006-01-02")
	err := db.QueryRow(query, today).Scan(&currentPeriodID)

	if err != nil {
		return nil
	}

	updateQuery := `UPDATE pay_periods SET status = 'past' WHERE id != ?`
	_, err = db.Exec(updateQuery, currentPeriodID)
	if err != nil {
		return fmt.Errorf("failed to cleanup period statuses: %v", err)
	}

	currentQuery := `UPDATE pay_periods SET status = 'current' WHERE id = ?`
	_, err = db.Exec(currentQuery, currentPeriodID)
	if err != nil {
		return fmt.Errorf("failed to set current period: %v", err)
	}

	return nil
}

// GetCurrentPayPeriod -
func (db *Database) GetCurrentPayPeriod(date string) (Paycheck, error) {
	query := `
		SELECT id, start_date, end_date, pay_date, expected_pay_gross, 
		       actual_pay_gross, actual_pay_net, last_updated
		FROM pay_periods 
		WHERE ? BETWEEN start_date AND end_date 
		AND status = 'current'
		ORDER BY start_date DESC
		LIMIT 1
	`

	var period Paycheck
	err := db.QueryRow(query, date).Scan(
		&period.ID, &period.BeginDate, &period.EndDate, &period.PayDate,
		&period.GrossEarned, &period.GrossActual, &period.NetActual,
		&period.LastUpdated,
	)

	if err == nil {
		return period, nil
	}

	return db.CreateNewPayPeriod(date)
}

// CreateNewPayPeriod -
func (db *Database) CreateNewPayPeriod(date string) (Paycheck, error) {
	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return Paycheck{}, fmt.Errorf("invalid date format: %v", err)
	}

	weekday := int(parsedDate.Weekday())
	if weekday == 0 { // Sunday
		weekday = 7
	}
	daysToMonday := weekday - 1
	monday := parsedDate.AddDate(0, 0, -daysToMonday)
	referenceMonday, _ := time.Parse("2006-01-02", "2025-01-06")

	daysDiff := int(monday.Sub(referenceMonday).Hours() / 24)

	biWeeklyPeriod := daysDiff / 14
	if daysDiff < 0 && daysDiff%14 != 0 {
		biWeeklyPeriod--
	}

	periodStart := referenceMonday.AddDate(0, 0, biWeeklyPeriod*14)
	periodEnd := periodStart.AddDate(0, 0, 13)
	payDate := periodEnd.AddDate(0, 0, 3)

	updateQuery := `UPDATE pay_periods SET status = 'past' WHERE status = 'current'`
	_, err = db.Exec(updateQuery)
	if err != nil {
		return Paycheck{}, fmt.Errorf("failed to update existing periods: %v", err)
	}

	insertQuery := `
		INSERT INTO pay_periods (start_date, end_date, pay_date, status)
		VALUES (?, ?, ?, 'current')
	`

	result, err := db.Exec(insertQuery,
		periodStart.Format("2006-01-02"),
		periodEnd.Format("2006-01-02"),
		payDate.Format("2006-01-02"),
	)

	if err != nil {
		return Paycheck{}, fmt.Errorf("failed to create pay period: %v", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return Paycheck{}, fmt.Errorf("failed to get new period ID: %v", err)
	}

	return Paycheck{
		ID:        int(id),
		BeginDate: periodStart.Format("2006-01-02"),
		EndDate:   periodEnd.Format("2006-01-02"),
		PayDate:   payDate.Format("2006-01-02"),
	}, nil
}

// GetCurrentRates -
func (db *Database) GetCurrentRates(date string) (PayRate, error) {
	query := `
		SELECT effective_date, cfi_rate, admin_rate, last_updated
		FROM pay_rates 
		WHERE effective_date <= ?
		ORDER BY effective_date DESC
		LIMIT 1
	`

	var rate PayRate
	err := db.QueryRow(query, date).Scan(
		&rate.EffectiveDate, &rate.CFIRate, &rate.AdminRate, &rate.LastUpdated,
	)

	if err != nil {
		// ridiculous rates to flag erroneous behavior
		return PayRate{
			EffectiveDate: date,
			CFIRate:       9999.99,
			AdminRate:     9999.99,
		}, nil
	}

	return rate, nil
}

// CalculatePeriodTotals -
func (db *Database) CalculatePeriodTotals(periodID int, startDate, endDate string) (map[string]interface{}, error) {
	rates, err := db.GetCurrentRates(startDate)
	if err != nil {
		return nil, fmt.Errorf("failed to get rates: %v", err)
	}

	hoursQuery := `
		SELECT 
			COALESCE(SUM(flight_hours), 0) as flight_hours,
			COALESCE(SUM(ground_hours), 0) as ground_hours,
			COALESCE(SUM(sim_hours), 0) as sim_hours,
			COALESCE(SUM(admin_hours), 0) as admin_hours,
			COALESCE(SUM(ride_count), 0) as total_rides
		FROM pay_entries 
		WHERE date BETWEEN ? AND ?
	`

	var flightHours, groundHours, simHours, adminHours float64
	var totalRides int
	err = db.QueryRow(hoursQuery, startDate, endDate).Scan(
		&flightHours, &groundHours, &simHours, &adminHours, &totalRides,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to calculate hours: %v", err)
	}

	// Add ride hours to admin hours (0.2 hours per ride)
	rideHours := float64(totalRides) * 0.2
	totalAdminHours := adminHours + rideHours

	cfiHours := flightHours + groundHours + simHours
	cfiPay := cfiHours * rates.CFIRate
	adminPay := totalAdminHours * rates.AdminRate
	totalGross := cfiPay + adminPay

	return map[string]interface{}{
		"period_id":    periodID,
		"flight_hours": flightHours,
		"ground_hours": groundHours,
		"sim_hours":    simHours,
		"admin_hours":  totalAdminHours, // Include ride hours
		"ride_hours":   rideHours,
		"total_rides":  totalRides,
		"total_hours":  cfiHours + totalAdminHours,
		"cfi_hours":    cfiHours,
		"cfi_rate":     rates.CFIRate,
		"admin_rate":   rates.AdminRate,
		"cfi_pay":      cfiPay,
		"admin_pay":    adminPay,
		"total_gross":  totalGross,
	}, nil
}
