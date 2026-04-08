package api

import (
	"encoding/json"
	"net/http"
	"webserver/internal/logger"
)

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		logger.Log.Infof("error writeJSON: cant encode %s", payload)
	}
}

type ErrorResponse struct {
	Error string `json:"error"`
}
