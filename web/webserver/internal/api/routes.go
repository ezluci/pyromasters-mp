package api

import (
	"net/http"
)

type BaseData struct {
	AppEnv      string
	Version     string
	CurrentUser *TokenData
}

func RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/", rootHandler)
	mux.HandleFunc("/api/login", loginHandler)
	mux.HandleFunc("/api/register", registerHandler)
	mux.HandleFunc("/api/logout", logoutHandler)
	mux.HandleFunc("/profile", ownProfileHandler)
	mux.HandleFunc("/profile/{username}", profileHandler)
}
