package model

import "time"

type User struct {
	ID           int
	Username     string
	PasswordHash string
	CreatedAt    time.Time
}
