package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

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

func auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		username, password, ok := r.BasicAuth()
		if !ok || username != "kh" || password != "369636" {
			w.Header().Set("WWW-Authenticate", `Basic realm="Pay Log Access"`)
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
		next(w, r)
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

func setupCurrentPeriod(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		// Get current date
		date := r.URL.Query().Get("date")
		if date == "" {
			date = time.Now().Format("2006-01-02")
		}

		// Get current pay period
		period, err := database.GetCurrentPayPeriod(date)
		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to get current period: %v", err),
			})
			return
		}

		// Calculate totals for this period
		totals, err := database.CalculatePeriodTotals(period.ID, period.BeginDate, period.EndDate)
		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to calculate totals: %v", err),
			})
			return
		}

		// Combine period and totals data
		responseData := map[string]interface{}{
			"period": period,
			"totals": totals,
		}

		data, _ := json.Marshal(responseData)
		toJSON(w, db.Response{
			Status:  "OK",
			Message: "Current period data retrieved",
			Data:    data,
		})
	}
}
