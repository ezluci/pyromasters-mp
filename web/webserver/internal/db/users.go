package db

import (
	"database/sql"
	"time"
	"webserver/internal/model"
)

func GetUserByUsername(username string) (*model.User, error) {
	row := DB.QueryRow(
		"select id, username, password_hash, created_at, bio, games_played,"+
			"wins, kills, bombs_placed, last_played from users where username = ?",
		username,
	)

	var u model.User
	var createdAtRaw int64
	var lastPlayedRaw *int64
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &createdAtRaw,
		&u.Bio, &u.GamesPlayed, &u.Wins, &u.Kills, &u.BombsPlaced, &lastPlayedRaw)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	u.CreatedAt = time.UnixMilli(createdAtRaw)
	if lastPlayedRaw != nil {
		lastPlayed := time.UnixMilli(*lastPlayedRaw)
		u.LastPlayed = &lastPlayed
	}

	return &u, nil
}
