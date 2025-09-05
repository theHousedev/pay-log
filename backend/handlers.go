package main

import (
	"encoding/json"
	"net/http"

	db "github.com/theHousedev/pay-log/backend/database"
)

func toJSON(w http.ResponseWriter, r db.Response) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(r)
}

func setupNewEntry(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		var entry db.Entry
		if err := json.NewDecoder(r.Body).Decode(&entry); err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: "Invalid JSON format",
			})
			return
		}

		response := database.NewEntry(entry)
		toJSON(w, response)
	}
}

func setupEditEntry(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := database.EditEntry()
		toJSON(w, response)
	}
}

func setupDeleteEntry(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := database.DeleteEntry()
		toJSON(w, response)
	}
}

func setupCheckHealth(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := database.CheckHealth()
		toJSON(w, response)
	}
}
