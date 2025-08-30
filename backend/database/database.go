package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

func Connect(path string) (*Database, error) {
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	createTableSQL := `
		CREATE TABLE IF NOT EXISTS time_entries (
			id INTEGER PRIMARY KEY,
			pay_period_id INTEGER,
			entry_date DATE NOT NULL,
			entry_time TIME, -- for timestamp tracking
			entry_type TEXT NOT NULL, -- 'flight', 'ground', 'admin', 'misc'
			hours DECIMAL(4,2) NOT NULL,
			customer_name TEXT,
			notes TEXT,
			ride_flag BOOLEAN DEFAULT FALSE,
			meeting_flag BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		return nil, fmt.Errorf("Failed to create pay entries table: %w", err)
	}

	return &Database{db: db}, nil
}

func Close(db *Database) error {
	err := db.db.Close()
	if err != nil {
		return fmt.Errorf("Error closing database: %w", err)
	}
	return nil
}
