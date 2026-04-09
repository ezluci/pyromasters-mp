package api

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"webserver/configs"
	"webserver/internal/logger"
	"webserver/internal/model"

	"github.com/golang-jwt/jwt/v5"
)

type TokenData struct {
	Username string
	ID       int
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type User = model.User

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		logger.Log.Infof("error writeJSON: cant encode %s", payload)
	}
}

func extractTokenData(r *http.Request) (*TokenData, error) {
	var tokenData TokenData

	cookie, err := r.Cookie("jwt_token")
	if err != nil {
		return nil, err
	}

	jwtTokenEncoded := cookie.Value
	jwtToken, err := jwt.Parse(jwtTokenEncoded, func(token *jwt.Token) (any, error) {
		return []byte(configs.Cfg.JWTSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

	if err != nil {
		return nil, err
	}
	claims, ok := jwtToken.Claims.(jwt.MapClaims)

	if !ok || !jwtToken.Valid {
		return nil, errors.New("invalid token claims, cant cast")
	}

	tokenData.Username, _ = claims["username"].(string)
	tokenData.ID, _ = strconv.Atoi(claims["user_id"].(string))
	return &tokenData, nil
}

func getBaseData(r *http.Request) BaseData {
	tokenData, _ := extractTokenData(r)
	return BaseData{
		AppEnv:      configs.Cfg.AppEnv,
		Version:     configs.Cfg.Version,
		CurrentUser: tokenData,
	}
}
