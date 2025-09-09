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

func (database *Database) FetchEntries(
	beginDate string, endDate string) ([]Entry, error) {
	query := `
		SELECT * FROM pay_entries
		WHERE date BETWEEN ? AND ?
		ORDER BY date DESC, time DESC
	`
	entries, err := database.DB.Query(query, beginDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch entries: %w", err)
	}
	defer entries.Close()

	var collectedEntries []Entry
	for entries.Next() {
		var entry Entry
		err := entries.Scan(
			&entry.Date, &entry.Time, &entry.FlightHours, &entry.GroundHours,
			&entry.SimHours, &entry.AdminHours, &entry.Customer, &entry.Notes,
			&entry.RideCount,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan entry: %w", err)
		}
		collectedEntries = append(collectedEntries, entry)
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
