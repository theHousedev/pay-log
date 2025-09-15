package database

import (
	"database/sql"
	"fmt"
	"os"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	*sql.DB
}

func Connect(path string) (*Database, error) {
	sqlDB, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	database := &Database{sqlDB}
	if err := database.createTables(); err != nil {
		return nil, err
	}
	if err := database.UpdatePayPeriodStatus(); err != nil {
		return nil, fmt.Errorf("failed to update period statuses: %w", err)
	}

	response := database.CheckHealth()
	if response.Status != "OK" {
		return nil, fmt.Errorf(
			"database init failed: %s",
			response.Message,
		)
	}
	return database, nil
}

func (database *Database) createTables() error {
	schema, err := os.ReadFile("database/schema.sql")
	if err != nil {
		return fmt.Errorf("schema read failed: %w", err)
	}

	_, err = database.Exec(string(schema))
	if err != nil {
		if strings.Contains(err.Error(), "already exists") {
			tableName := getTableName(err.Error())
			fmt.Printf("table already exists: %s\n", tableName)
			return nil
		}
		return fmt.Errorf("table creation failed: %w", err)
	}
	return nil
}

func (database *Database) CheckHealth() Response {
	if err := database.Ping(); err != nil {
		return Response{
			Status:  "DOWN",
			Message: fmt.Sprintf("database ping failed: %v", err),
		}
	}
	return Response{
		Status:  "OK",
		Message: "Database server is running.",
	}
}

func (database *Database) UpdatePaycheck(check Paycheck) Response {
	return Response{
		Status:  "OK",
		Message: "Paycheck updated (TODO)",
	}
}

func (database *Database) FetchEntries(beginDate string, endDate string) ([]Entry, error) {
	query := `
        SELECT id, type, date, time, flight_hours, ground_hours, sim_hours, 
               admin_hours, customer, notes, ride_count, meeting
        FROM pay_entries 
    `

	var args []interface{}

	if beginDate != "all" && endDate != "all" {
		beginDate = strings.Split(beginDate, "T")[0]
		endDate = strings.Split(endDate, "T")[0]
		query += "WHERE date BETWEEN ? AND ?"
		args = []interface{}{beginDate, endDate}
	}

	query += "ORDER BY date DESC, time DESC"

	rows, err := database.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch entries: %w", err)
	}
	defer rows.Close()

	var collectedEntries []Entry
	for rows.Next() {
		var entry Entry
		err := rows.Scan(
			&entry.ID, &entry.Type, &entry.Date, &entry.Time,
			&entry.FlightHours, &entry.GroundHours, &entry.SimHours,
			&entry.AdminHours, &entry.Customer, &entry.Notes,
			&entry.RideCount, &entry.Meeting,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan entry: %w", err)
		}
		collectedEntries = append(collectedEntries, entry)
	}

	if collectedEntries == nil {
		collectedEntries = []Entry{}
	}

	return collectedEntries, nil
}

func (database *Database) Close() error {
	err := database.DB.Close()
	if err != nil {
		return fmt.Errorf("error closing database: %w", err)
	}
	return nil
}
