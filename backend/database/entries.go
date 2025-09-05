package database

import "fmt"

const newEntrySQL = `
INSERT INTO pay_entries (
    type, date, time, 
    flight_hours, ground_hours, sim_hours, admin_hours,
    customer, notes, ride_count, meeting
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

func (db *Database) NewEntry(entry Entry) Response {
	fmt.Printf("new entry - ")

	result, err := db.Exec(newEntrySQL,
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
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("error creating entry: %v", err),
		}
	}

	newID, err := result.LastInsertId()
	if err != nil {
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("entry created with unknown ID: %v", err),
		}
	}

	return Response{
		Data:    entry,
		Status:  "OK",
		Message: fmt.Sprintf("success, entry ID: %d", newID),
	}
}

func (db *Database) EditEntry() Response {
	return Response{
		Status:  "OK",
		Message: "Edited entry (TODO)",
	}
}

func (db *Database) DeleteEntry() Response {
	return Response{
		Status:  "OK",
		Message: "Entry deleted (TODO)",
	}
}

func (db *Database) GetCheckEntries(checkID int) ([]Entry, error) {
	rows, err := db.Query("SELECT * FROM pay_entries WHERE check_id = ?", checkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var entry Entry
		err = rows.Scan(&entry.ID, &entry.Type, &entry.Date, &entry.Time, &entry.FlightHours, &entry.GroundHours, &entry.SimHours, &entry.AdminHours, &entry.Customer, &entry.Notes, &entry.RideCount, &entry.Meeting)
		if err != nil {
			return nil, err
		}
		entries = append(entries, entry)
	}
	return entries, nil
}
