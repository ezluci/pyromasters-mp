package api

import (
	"log"
	"net/http"
	"os"
	"strings"
	"webserver/internal/templates"
)

func rootHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	path = strings.TrimPrefix(path, "/")
	lowerPath := strings.ToLower(path)

	log.Default().Print(r.URL)

	if strings.HasSuffix(lowerPath, ".js") {
		w.Header().Set("Content-Type", "text/javascript")
	} else if strings.HasSuffix(lowerPath, ".css") {
		w.Header().Set("Content-Type", "text/css")
	}

	// serve the 3 html pages
	if lowerPath == "" || lowerPath == "gamepc" || lowerPath == "gamemobile" {
		w.Header().Set("Content-Type", "text/html")
		if lowerPath == "" {
			lowerPath = "index"
		}
		tmpl := templates.Templates.Lookup(lowerPath + ".html")
		if err := tmpl.Execute(w, ""); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// serve non html content
	fileContents, err := os.ReadFile("../public/" + path)
	if err != nil {
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusNotFound)
		tmpl := templates.Templates.Lookup("404.html")
		if err := tmpl.Execute(w, ""); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	w.Write(fileContents)
}
