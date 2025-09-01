package main

import (
	"encoding/json"
	"net/http"

	"github.com/theHousedev/pay-log/backend/database"
)

func toJSON(w http.ResponseWriter, response database.Response) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func newEntry(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		var entry database.Entry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
			toJSON(w, database.Response{
				Status:  "ERROR",
				Message: "Invalid JSON format",
			})
			return
		}

		response := db.NewEntry(entry)
		toJSON(w, response)
	}
}

func editEntry(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := db.EditEntry()
		toJSON(w, response)
	}
}

func deleteEntry(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := db.DeleteEntry()
		toJSON(w, response)
	}
}

func healthCheck(db *database.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := db.HealthCheck()
		toJSON(w, response)
	}
}
