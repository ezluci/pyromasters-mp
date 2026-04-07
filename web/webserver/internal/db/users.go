package db

import (
	"database/sql"
	"webserver/internal/model"
)

func GetUserByUsername(username string) (*model.User, error) {
	row := DB.QueryRow(
		"select id, username, password_hash, created_at from users where username = ?",
		username,
	)

	var u model.User
	err := row.Scan(&u.ID, &u.Username, &u.PasswordHash, &u.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &u, nil
}
