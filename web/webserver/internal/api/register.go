package api

import (
	"net/http"
	"regexp"
	"time"
	"webserver/internal/db"
	"webserver/internal/logger"

	"github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

type RegisterResponse struct {
}

var (
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{2,15}$`)
	passwordRegex = regexp.MustCompile(`^[ -~]{5,50}$`)
)

func registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{
			Error: "method not allowed",
		})
		return
	}

	err := r.ParseForm()
	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "invalid form data",
		})
		return
	}

	username := r.Form.Get("username")
	if !isUsernameValid(username) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "username must match " + usernameRegex.String(),
		})
		return
	}

	password := r.Form.Get("password")
	if !isPasswordValid(password) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "password must match " + passwordRegex.String(),
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{
			Error: "cant hash password",
		})
		return
	}

	_, err = db.DB.Exec(
		"insert into users (username, password_hash, created_at) values (?, ?, ?)",
		username, hashedPassword, time.Now().UnixMilli(),
	)

	if err != nil {
		if me, ok := err.(*mysql.MySQLError); ok {
			if me.Number == 1062 {
				writeJSON(w, http.StatusConflict, ErrorResponse{
					Error: "username already exists",
				})
				logger.Log.Infof("username %s already exists", username)
				return
			}
		}

		logger.Log.Errorf("cant decode error %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{
			Error: "cant decode error",
		})
		return
	}

	writeJSON(w, http.StatusCreated, RegisterResponse{})
	logger.Log.Infof("new user registered: %s", username)
}

func isUsernameValid(username string) bool {
	return usernameRegex.MatchString(username)
}

func isPasswordValid(password string) bool {
	return passwordRegex.MatchString(password)
}
