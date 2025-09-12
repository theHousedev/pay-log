package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
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
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Redirect(w, r, "/login", http.StatusTemporaryRedirect)
			return
		}

		if !validateSession(cookie.Value) {
			http.Redirect(w, r, "/login", http.StatusTemporaryRedirect)
			return
		}

		next(w, r)
	}
}

func getCredentials() (string, string) {
	return os.Getenv("PAYUN"), os.Getenv("PAYPS")
}

func setupLogin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uname, pw := getCredentials()

		if r.Method == "POST" {
			usernameInput := r.FormValue("username")
			passwordInput := r.FormValue("password")
			if usernameInput == uname && passwordInput == pw {
				session := createSession(usernameInput) // success cookie
				http.SetCookie(w, &http.Cookie{
					Name:     "session_id",
					Value:    session.ID,
					Expires:  time.Now().Add(SessionDuration),
					HttpOnly: true,
					Secure:   true,
					SameSite: http.SameSiteStrictMode,
				})
				http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
			} else {
				http.Redirect(w, r, "/login", http.StatusTemporaryRedirect)
			}
		} else {
			http.Redirect(w, r, "/login", http.StatusTemporaryRedirect)
		}
	}
}

func setupEditEntry(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := database.EditEntry(r.URL.Query().Get("id"))
		toJSON(w, response)
	}
}

func setupDeleteEntry(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := database.DeleteEntry(r.URL.Query().Get("id"))
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

		date := r.URL.Query().Get("date")
		if date == "" {
			date = time.Now().In(time.Local).Format("2006-01-02")
		}

		period, err := database.GetCurrentPayPeriod(date)
		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to get current period: %v", err),
			})
			return
		}

		totals, err := database.CalculatePeriodTotals(period.ID, period.BeginDate, period.EndDate)
		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to calculate totals: %v", err),
			})
			return
		}

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

func setupGetEntries(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		view := r.URL.Query().Get("view")
		if view == "" {
			view = "period"
		}

		date := r.URL.Query().Get("date")
		if date == "" {
			date = time.Now().In(time.Local).Format("2006-01-02")
		}

		var entries []db.Entry
		var err error

		switch view {
		case "period":
			period, err := database.GetCurrentPayPeriod(date)
			if err != nil {
				toJSON(w, db.Response{
					Status:  "ERROR",
					Message: fmt.Sprintf("Failed to get current period: %v", err),
				})
				return
			}
			entries, err = database.FetchEntries(period.BeginDate, period.EndDate)

		case "day":
			entries, err = database.FetchEntries(date, date)

		case "week":
			startOfWeek, endOfWeek := getCurrentWeek(date)
			entries, err = database.FetchEntries(startOfWeek, endOfWeek)

		case "all":
			entries, err = database.FetchEntries("all", "all")

		default:
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: "Invalid view type. Use: period, day, week, or all",
			})
			return
		}

		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to get entries: %v", err),
			})
			return
		}

		data, _ := json.Marshal(entries)
		toJSON(w, db.Response{
			Status:  "OK",
			Message: fmt.Sprintf("Entries retrieved for %s view", view),
			Data:    data,
		})
	}
}

func getCurrentWeek(dateStr string) (string, string) {
	date, _ := time.Parse("2006-01-02", dateStr)
	startOfWeek := date.AddDate(0, 0, -int(date.Weekday())+1) // monday
	endOfWeek := startOfWeek.AddDate(0, 0, 6)                 // sunday
	return startOfWeek.Format("2006-01-02"), endOfWeek.Format("2006-01-02")
}
