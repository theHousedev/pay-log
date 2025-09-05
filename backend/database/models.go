package database

import "encoding/json"

type Entry struct {
	Type        string   `json:"type"`
	Date        string   `json:"date"`
	Time        string   `json:"time"`
	FlightHours *float64 `json:"flight_hours,omitempty"`
	GroundHours *float64 `json:"ground_hours,omitempty"`
	SimHours    *float64 `json:"sim_hours,omitempty"`
	AdminHours  *float64 `json:"admin_hours,omitempty"`
	Customer    *string  `json:"customer,omitempty"`
	Notes       *string  `json:"notes,omitempty"`
	RideCount   *int     `json:"ride_count,omitempty"`
	Meeting     bool     `json:"meeting"`
}

type Paycheck struct {
	ID          int      `json:"id"`
	BeginDate   string   `json:"begin_date"`
	EndDate     string   `json:"end_date"`
	PayDate     string   `json:"pay_date"`
	FlightHours *float64 `json:"flight_hours"`
	GroundHours *float64 `json:"ground_hours"`
	SimHours    *float64 `json:"sim_hours"`
	AdminHours  *float64 `json:"admin_hours"`
	TotalHours  *float64 `json:"total_hours"`
	GrossEarned float64  `json:"gross_earnings"`
	GrossActual float64  `json:"gross_actual"`
	NetActual   float64  `json:"net_actual"`
	LastUpdated string   `json:"last_updated"`
}

type PayRate struct {
	EffectiveDate string  `json:"effective_date"`
	FlightRate    float64 `json:"flight_rate"`
	AdminRate     float64 `json:"admin_rate"`
}

type Response struct {
	Status  string          `json:"status"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data,omitempty"`
}
