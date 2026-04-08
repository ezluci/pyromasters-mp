package api

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/", rootHandler)
	mux.HandleFunc("/api/login", loginHandler)
	mux.HandleFunc("/api/register", registerHandler)
	mux.HandleFunc("/api/logout", logoutHandler)
}
