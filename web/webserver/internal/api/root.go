package api

import (
	"net/http"
	"strings"
	"webserver/configs"
	"webserver/internal/templates"
)

type IndexPageData struct {
	BaseData
}

type GamePageData struct {
	BaseData
	SocketUrl string
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	path = strings.TrimPrefix(path, "/")
	lowerPath := strings.ToLower(path)

	if strings.HasSuffix(lowerPath, ".js") {
		w.Header().Set("Content-Type", "text/javascript")
	} else if strings.HasSuffix(lowerPath, ".css") {
		w.Header().Set("Content-Type", "text/css")
	}

	// serve the 3 html pages
	if lowerPath == "" || lowerPath == "gamepc" || lowerPath == "gamemobile" {
		if lowerPath == "" {
			lowerPath = "index"
		}
		tmpl := templates.Lookup(lowerPath)

		baseData := getBaseData(r)
		var data any
		if lowerPath == "index" {
			data = IndexPageData{baseData}
		} else {
			data = GamePageData{baseData, configs.Cfg.SocketUrl}
		}

		w.Header().Set("Content-Type", "text/html")
		if err := tmpl.Execute(w, data); err != nil {
			http.Error(w, "cant execute template", http.StatusInternalServerError)
			return
		}
		return
	}

	// serve static content
	http.FileServer(http.Dir("../public")).ServeHTTP(w, r)
}
