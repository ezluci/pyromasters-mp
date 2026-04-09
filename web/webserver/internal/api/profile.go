package api

import (
	"net/http"
	"webserver/internal/db"
	"webserver/internal/logger"
	"webserver/internal/templates"
)

type ProfilePageData struct {
	BaseData
	Username string
}

func ownProfileHandler(w http.ResponseWriter, r *http.Request) {
	tokenData, err := extractTokenData(r)
	if err != nil {
		logger.Log.Errorf("cant extract token: %v", err)
		http.Error(w, "cant extract token", http.StatusInternalServerError)
		return
	}

	if tokenData != nil {
		http.Redirect(w, r, "/profile/"+tokenData.Username, http.StatusSeeOther)
		return
	} else {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	username := r.PathValue("username")

	user, err := db.GetUserByUsername(username)
	if err != nil {
		logger.Log.Errorf("cant get user %s: %v", username, err)
		http.Error(w, "cant get user", http.StatusInternalServerError)
		return
	}

	if user == nil {
		http.NotFound(w, r)
		return
	}

	baseData := getBaseData(r)
	tmpl := templates.Lookup("profile")

	data := ProfilePageData{
		BaseData: baseData,
		Username: user.Username,
	}

	w.Header().Set("Content-Type", "text/html")
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, "cant execute template", http.StatusInternalServerError)
		return
	}
}
