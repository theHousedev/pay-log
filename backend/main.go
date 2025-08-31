package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/theHousedev/pay-log/backend/database"
)

func getPort() string {
	port := os.Getenv("SITE_BACKEND_PORT")
	if port == "" {
		log.Fatal("ERR: SITE_BACKEND_PORT missing, check config")
	}
	return port
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
	dbPath := "./pay_log.db"
	port := getPort()

	db := openDB(dbPath)
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
