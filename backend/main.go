package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
	"github.com/theHousedev/pay-log/backend/database"
	"go.yaml.in/yaml/v3"
)

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
	fmt.Println("\x1b[33m" + "server startup" + "\x1b[0m")

	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		db, err := database.Connect(dbPath)
		if err != nil {
			fmt.Printf(err.Error())
			log.Fatal("database creation failed")
		}
		fmt.Printf("\x1b[32m"+"new database created at '%s'"+"\x1b[0m\n", dbPath)
		return db
	}

	db, err := database.Connect(dbPath)
	if err != nil {
		fmt.Printf(err.Error())
		log.Fatal("database connection failed")
	}
	fmt.Println("\x1b[32m" + "database initialized" + "\x1b[0m")
	return db
}

func main() {
	databasePath := "./pay_log.db"
	db := openDB(databasePath)
	defer db.Close()

	cfg, err := loadConfig()
	if err != nil {
		log.Fatal("failed to load config: ", err)
	}

	allowedOriginLoc := os.Getenv("ALLOWED_ORIGIN")
	if allowedOriginLoc == "" {
		fmt.Println("ALLOWED_ORIGIN not set; defaulting to *")
		allowedOriginLoc = "*"
	}
	allowedOriginLAN := fmt.Sprintf("http://10.0.0.8:%s", cfg.FrontendPort)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{allowedOriginLoc, allowedOriginLAN},
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})

	http.HandleFunc("/api/new", newEntry(db))
	http.HandleFunc("/api/edit", editEntry(db))
	http.HandleFunc("/api/delete", deleteEntry(db))
	http.HandleFunc("/api/health", healthCheck(db))

	fmt.Printf("\x1b[32m"+"running on 127.0.0.1:%s"+"\x1b[0m\n", cfg.BackendPort)
	handler := c.Handler(http.DefaultServeMux)
	log.Fatal(http.ListenAndServe(
		fmt.Sprintf("127.0.0.1:%s", cfg.BackendPort), handler))
}
