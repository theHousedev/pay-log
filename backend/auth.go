package main

import (
	"log"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	CreatedAt string `json:"created_at"`
	ExpiresAt string `json:"expires_at"`
}

var Sessions = make(map[string]Session)
var SessionDuration = 30 * 24 * time.Hour

func createSession(username string) Session {
	newSession := uuid.New().String()
	Sessions[newSession] = Session{
		ID:        newSession,
		Username:  username,
		CreatedAt: time.Now().Format(time.RFC3339),
		ExpiresAt: time.Now().Add(SessionDuration).Format(time.RFC3339),
	}
	return Sessions[newSession]
}

func validateSession(id string) bool {
	session, exists := Sessions[id]
	if !exists {
		return false
	}

	expiresAt, err := parseTime(session.ExpiresAt)
	if err != nil {
		return false
	}

	return time.Now().Before(expiresAt)
}

func parseTime(timeString string) (time.Time, error) {
	parsedTime, err := time.Parse(time.RFC3339, timeString)
	if err != nil {
		log.Println("Error parsing time")
		return time.Time{}, err
	}
	return parsedTime, nil
}
