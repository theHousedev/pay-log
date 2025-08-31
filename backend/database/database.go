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

func Connect(path string) (*Database, error) {
	sqlDB, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	db := &Database{sqlDB}

	if err := db.createTables(); err != nil {
		return nil, err
	}

	response := db.GetHealth()
	if response.Status != "OK" {
		return nil, fmt.Errorf("database init failed: %s", response.Message)
	}
	return db, nil
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

func (db *Database) GetHealth() Response {
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

func (db *Database) NewEntry() Response {
	return Response{
		Status:  "OK",
		Message: "[TODO] New entry created: .",
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

func (db *Database) Close() error {
	err := db.DB.Close()
	if err != nil {
		return fmt.Errorf("error closing database: %w", err)
	}
	return nil
}
