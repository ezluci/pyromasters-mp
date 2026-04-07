package api

import (
	"log"
	"net/http"
	"time"
	"webserver/configs"
	"webserver/internal/db"
	"webserver/internal/model"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginResponse struct {
}

type User = model.User

func loginHandler(w http.ResponseWriter, r *http.Request) {
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
	password := r.Form.Get("password")

	var user *User
	if user, err = db.GetUserByUsername(username); err != nil || user == nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "user doesnt exist",
		})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{
			Error: "wrong password",
		})
		return
	}

	exp := time.Now().Add(10 * 24 * time.Hour)
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      exp.Unix(),
		"iat":      time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(configs.Cfg.JWTSecret))
	if err != nil {
		log.Printf("error cant sign token: %s", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{
			Error: "cant sign token",
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt_token",
		Value:    signedToken,
		Path:     "/",
		Expires:  exp,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	})

	writeJSON(w, http.StatusOK, LoginResponse{})
}
