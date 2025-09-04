package database

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	*sql.DB
}

type Response struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

type Entry struct {
	Type        string   `json:"type"`
	Date        string   `json:"date"`
	Time        string   `json:"time"`
	FlightHours *float64 `json:"flight_hours"`
	GroundHours *float64 `json:"ground_hours"`
	SimHours    *float64 `json:"sim_hours"`
	AdminHours  *float64 `json:"admin_hours"`
	Customer    string   `json:"customer"`
	Notes       string   `json:"notes"`
	RideCount   int      `json:"ride_count"`
	Meeting     bool     `json:"meeting"`
}

func nilCheck(f *float64) any {
	if f == nil {
		return nil
	}
	return *f
}

func (db *Database) createTables() error {
	schema, err := os.ReadFile("database/schema.sql")
	if err != nil {
		return fmt.Errorf("schema read failed [%w]", err)
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		return fmt.Errorf("table creation failed [%w]", err)
	}

	return nil
}

func (db *Database) HealthCheck() Response {
	if err := db.Ping(); err != nil {
		return Response{
			Status:  "DOWN",
			Message: fmt.Sprintf("database ping failed. %v", err),
		}
	}
	return Response{
		Status:  "OK",
		Message: "Database server is running.",
	}
}

const newEntrySQL = `
INSERT INTO pay_events (
    type, date, time, 
    flight_hours, ground_hours, sim_hours, admin_hours,
    customer, notes, ride_count, meeting
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

func (db *Database) NewEntry(entry Entry) Response {
	fmt.Println("New entry called.")

	result, err := db.Exec(newEntrySQL,
		entry.Type,
		entry.Date,
		entry.Time,
		nilCheck(entry.FlightHours),
		nilCheck(entry.GroundHours),
		nilCheck(entry.SimHours),
		nilCheck(entry.AdminHours),
		entry.Customer,
		entry.Notes,
		entry.RideCount,
		entry.Meeting,
	)
	if err != nil {
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("Error creating entry: %v", err),
		}
	}

	newID, err := result.LastInsertId()
	if err != nil {
		return Response{
			Status:  "ERROR",
			Message: fmt.Sprintf("Entry created with unknown ID: %v", err),
		}
	}

	return Response{
		Data:    entry,
		Status:  "OK",
		Message: fmt.Sprintf("Successfully created entry ID: %d", newID),
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

func Connect(path string) (*Database, error) {
	sqlDB, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	db := &Database{sqlDB}

	if err := db.createTables(); err != nil {
		return nil, err
	}

	response := db.HealthCheck()
	if response.Status != "OK" {
		return nil, fmt.Errorf("database init failed: %s", response.Message)
	}
	return db, nil
}

func (db *Database) Close() error {
	err := db.DB.Close()
	if err != nil {
		return fmt.Errorf("error closing database: %w", err)
	}
	return nil
}
