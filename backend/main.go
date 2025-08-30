package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/theHousedev/pay-log/backend/database"
)

func main() {
	fmt.Println("Starting pay-log database server...")

	port := os.Getenv("SITE_BACKEND_PORT")
	if port == "" {
		port = "5000"
	}

	db, err := database.Connect("./pay_log.db")
	if err != nil {
		log.Fatal("Failed to create database: ", err)
	}
	defer database.Close(db)
	fmt.Println("Database initialized.")

	// CORS setup
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		log.Println("WARNING: ALLOWED_ORIGIN not set; defaulting to * for dev only")
		allowedOrigin = "*"
	}

	// Health endpoint
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status": "OK", "message": "Pay logging server is running"}`)
	})

	// Start server
	log.Printf("Starting server on 127.0.0.1:%s", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("127.0.0.1:%s", port), nil))
}
