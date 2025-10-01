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

func setupAuthOK() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// If we reach here, the auth() middleware has already validated the session
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "authenticated"}`))
	}
}

func auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if !validateSession(cookie.Value) {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
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
				session := createSession(usernameInput)
				http.SetCookie(w, &http.Cookie{
					Name:     "session_id",
					Value:    session.ID,
					Expires:  time.Now().Add(SessionDuration),
					HttpOnly: true,
					Secure:   true,
					SameSite: http.SameSiteStrictMode,
				})
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(`{"status": "success", "redirect": "/"}`))
			} else {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"status": "error", "message": "Invalid credentials"}`))
			}
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func setupEditEntry(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
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

		response := database.UpdateEntry(entry)
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

func setupGetAllPeriods(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
			return
		}

		periods, err := database.GetAllPeriods()
		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to get pay periods: %v", err),
			})
			return
		}

		data, _ := json.Marshal(periods)
		toJSON(w, db.Response{
			Status:  "OK",
			Message: "All pay periods retrieved",
			Data:    data,
		})
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

func setupGetTotals(database *db.Database) http.HandlerFunc {
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
		var totals map[string]interface{}

		switch view {
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
				Message: "Invalid view type for totals",
			})
			return
		}

		if err != nil {
			toJSON(w, db.Response{
				Status:  "ERROR",
				Message: fmt.Sprintf("Failed to fetch entries: %v", err),
			})
			return
		}

		totals = calculateTotalsFromEntries(entries)

		data, _ := json.Marshal(totals)
		toJSON(w, db.Response{
			Status:  "OK",
			Message: fmt.Sprintf("Totals retrieved for %s view", view),
			Data:    data,
		})
	}
}

func safeFloat64(ptr *float64) float64 {
	if ptr != nil {
		return *ptr
	}
	return 0.0
}

func calculateTotalsFromEntries(entries []db.Entry) map[string]interface{} {
	var flightHours, groundHours, simHours, adminHours, totalHours float64
	var totalGross float64
	cfiRate := 26.50
	adminRate := 13.75

	for _, entry := range entries {
		fh := safeFloat64(entry.FlightHours)
		gh := safeFloat64(entry.GroundHours)
		sh := safeFloat64(entry.SimHours)
		ah := safeFloat64(entry.AdminHours)

		if entry.Type == "admin" && entry.RideCount != nil && *entry.RideCount > 0 {
			rideAdminHours := float64(*entry.RideCount) * 0.2
			ah = rideAdminHours
		}

		flightHours += fh
		groundHours += gh
		simHours += sh
		adminHours += ah
		cfiHours := fh + gh + sh
		cfiPay := cfiHours * cfiRate
		adminPay := ah * adminRate
		totalGross += cfiPay + adminPay
	}

	totalHours = flightHours + groundHours + simHours + adminHours

	return map[string]interface{}{
		"flight_hours": flightHours,
		"ground_hours": groundHours,
		"sim_hours":    simHours,
		"admin_hours":  adminHours,
		"all_hours":    totalHours,
		"gross":        totalGross,
		"cfi_rate":     cfiRate,
		"admin_rate":   adminRate,
	}
}

func getCurrentWeek(dateStr string) (string, string) {
	date, _ := time.Parse("2006-01-02", dateStr)
	startOfWeek := date.AddDate(0, 0, -int(date.Weekday())+1) // monday
	endOfWeek := date                                         // today (not sunday)
	return startOfWeek.Format("2006-01-02"), endOfWeek.Format("2006-01-02")
}
