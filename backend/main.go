package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/theHousedev/pay-log/backend/database"
	"go.yaml.in/yaml/v3"
)

type EntryData struct {
	Date     string  `json:"date"`
	Time     string  `json:"time"`
	Type     string  `json:"type"`
	Flight   float64 `json:"flight"`
	Ground   float64 `json:"ground"`
	Admin    float64 `json:"admin"`
	Customer string  `json:"name"`
	Notes    string  `json:"notes"`
	Rides    int     `json:"rides"`
	Meeting  bool    `json:"meeting"`
}

type SiteConfig struct {
	BackendPort  string `yaml:"backend_port"`
	FrontendPort string `yaml:"frontend_port"`
}

func loadConfig() (*SiteConfig, error) {
	cfgPath := "../cfg.yaml"
	data, err := os.ReadFile(cfgPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config: %w", err)
	}
	var cfg SiteConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}
	return &cfg, nil
}

func openDB(dbPath string) *database.Database {
	fmt.Println("Starting pay-log database server...")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		db, err := database.Connect(dbPath)
		if err != nil {
			log.Fatal("Failed to create database: ", err)
		}
		fmt.Println("New database created at '", dbPath, "'")
		return db
	}
	db, err := database.Connect(dbPath)
	if err != nil {
		log.Fatal("", err)
	}
	fmt.Println("Database initialized.")
	return db
}

func toJSON(w http.ResponseWriter, response database.Response) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	databasePath := "./pay_log.db"
	cfg, err := loadConfig()
	if err != nil {
		log.Fatal("Failed to load config: ", err)
	}
	port := cfg.BackendPort

	db := openDB(databasePath)
	defer db.Close()

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		log.Println("WARNING: ALLOWED_ORIGIN not set; defaulting to *")
		allowedOrigin = "*"
	}

	health := "/api/health"
	new := "/api/new-entry"
	edit := "/api/edit-entry"
	delete := "/api/delete-entry"

	http.HandleFunc(health, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		response := db.GetHealth()
		toJSON(w, response)
	})

	http.HandleFunc(new, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		response := db.NewEntry()
		toJSON(w, response)
	})

	http.HandleFunc(edit, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		response := db.EditEntry()
		toJSON(w, response)
	})

	http.HandleFunc(delete, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		response := db.DeleteEntry()
		toJSON(w, response)
	})

	log.Printf("Starting server on 127.0.0.1:%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("127.0.0.1:%s", port), nil))
}
