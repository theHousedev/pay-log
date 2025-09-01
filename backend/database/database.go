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
	Type     string  `json:"type"`
	Date     string  `json:"date"`
	Time     string  `json:"time"`
	Flight   float64 `json:"flight"`
	Ground   float64 `json:"ground"`
	Sim      float64 `json:"sim"`
	Admin    float64 `json:"admin"`
	Customer string  `json:"customer"`
	Notes    string  `json:"notes"`
	Rides    int     `json:"rides"`
	Meeting  bool    `json:"meeting"`
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

func (db *Database) NewEntry(entry Entry) Response {
	return Response{
		Status: "OK",
		Message: fmt.Sprintf(
			"Entry created: %v hours for %s",
			entry.Flight,
			entry.Customer),
		Data: entry,
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
