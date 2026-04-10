package model

import "time"

type User struct {
	ID           int
	Username     string
	PasswordHash string
	CreatedAt    time.Time
	Bio          string
	GamesPlayed  int
	Wins         int
	Kills        int
	BombsPlaced  int
	LastPlayed   *time.Time
}
