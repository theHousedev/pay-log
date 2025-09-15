package database

import (
	"encoding/json"
	"fmt"
	"log"
)

const newEntrySQL = `
INSERT INTO pay_entries (
    pay_period_id, type, date, time, 
    flight_hours, ground_hours, sim_hours, admin_hours,
    customer, notes, ride_count, meeting
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

func (database *Database) NewEntry(entry Entry) Response {
	payPeriod, err := database.GetCurrentPayPeriod(entry.Date)
	if err != nil {
		fmt.Printf("Error getting pay period: %v\n", err)
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("error getting pay period: %v", err),
		}
	}

	result, err := database.Exec(newEntrySQL,
		payPeriod.ID,
		entry.Type,
		entry.Date,
		entry.Time,
		nilCheck(entry.FlightHours),
		nilCheck(entry.GroundHours),
		nilCheck(entry.SimHours),
		nilCheck(entry.AdminHours),
		nilCheck(entry.Customer),
		nilCheck(entry.Notes),
		nilCheck(entry.RideCount),
		entry.Meeting,
	)
	if err != nil {
		fmt.Printf("Error! %v\n", err)
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("error creating entry: %v", err),
		}
	}

	newID, err := result.LastInsertId()
	if err != nil {
		fmt.Printf("Error, ID unknown! %v\n", err)
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("created entry, ID error: %v", err),
		}
	}

	err = database.UpdatePayPeriodTotals(payPeriod.ID)
	if err != nil {
		log.Printf("Warning: failed to update pay period totals: %v", err)
	}

	log.Printf("Created entry ID: %d\n", newID)
	return Response{
		Status:  "OK",
		Message: "New entry created:",
		Data:    json.RawMessage(fmt.Sprintf(`{"entry_id": %d}`, newID)),
	}
}

func (database *Database) UpdateEntry(entry Entry) Response {
	var currentPayPeriodID int
	err := database.QueryRow("SELECT pay_period_id FROM pay_entries WHERE id = ?", entry.ID).Scan(&currentPayPeriodID)
	if err != nil {
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("Unable to find entry ID=%d: %s", entry.ID, err),
		}
	}

	payPeriod, err := database.GetCurrentPayPeriod(entry.Date)
	if err != nil {
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("error getting pay period: %v", err),
		}
	}

	updateQuery := `
UPDATE pay_entries SET pay_period_id = ?, date = ?, time = ?, flight_hours = ?,
ground_hours = ?, sim_hours = ?, admin_hours = ?, customer = ?,
notes = ?, ride_count = ?, meeting = ? WHERE id = ?`
	_, err = database.Exec(updateQuery, payPeriod.ID, entry.Date, entry.Time, entry.FlightHours,
		entry.GroundHours, entry.SimHours, entry.AdminHours, entry.Customer, entry.Notes,
		entry.RideCount, entry.Meeting, entry.ID)
	if err != nil {
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("Unable to update entry ID=%d: %s", entry.ID, err),
		}
	}

	log.Printf("Updated entry ID: %d\n", entry.ID)

	err = database.UpdatePayPeriodTotals(payPeriod.ID)
	if err != nil {
		log.Printf("Warning: failed to update new pay period totals: %v", err)
	}

	if currentPayPeriodID != payPeriod.ID {
		err = database.UpdatePayPeriodTotals(currentPayPeriodID)
		if err != nil {
			log.Printf("Warning: failed to update old pay period totals: %v", err)
		}
	}

	return Response{
		Status:  "OK",
		Message: "Updated entry:",
		Data:    json.RawMessage(fmt.Sprintf(`{"entry_id": %d}`, entry.ID)),
	}
}

func (database *Database) DeleteEntry(id string) Response {
	var payPeriodID int
	err := database.QueryRow("SELECT pay_period_id FROM pay_entries WHERE id = ?", id).Scan(&payPeriodID)
	if err != nil {
		msg := fmt.Sprintf("Unable to find entry ID=%s: %s", id, err)
		log.Printf("Delete error: %s\n", msg)
		return Response{
			Status:  "ERROR",
			Message: msg,
		}
	}

	query := "DELETE FROM pay_entries WHERE id = ?"
	_, err = database.Exec(query, id)
	if err != nil {
		msg := fmt.Sprintf("Unable to delete entry ID=%s: %s", id, err)
		log.Printf("Delete error: %s\n", msg)
		return Response{
			Status:  "ERROR",
			Message: msg,
		}
	}

	log.Printf("Deleted entry ID: %s\n", id)
	err = database.UpdatePayPeriodTotals(payPeriodID)
	if err != nil {
		log.Printf("Warning: failed to update pay period totals after deletion: %v", err)
	}
	return Response{
		Status:  "OK",
		Message: "Entry deleted:",
		Data:    json.RawMessage(fmt.Sprintf(`{"entry_id": %s}`, id)),
	}
}

func (database *Database) GetCheckEntries(checkID int) ([]Entry, error) {
	rows, err := database.Query("SELECT * FROM pay_entries WHERE check_id = ?", checkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var entry Entry
		err = rows.Scan(&entry.ID, &entry.Type, &entry.Date, &entry.Time, &entry.FlightHours,
			&entry.GroundHours, &entry.SimHours, &entry.AdminHours, &entry.Customer,
			&entry.Notes, &entry.RideCount, &entry.Meeting)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	return entries, nil
}
