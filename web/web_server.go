package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

var version string
var port string

func main() {

	err := godotenv.Load("../.env")
	if err != nil {
		log.Default().Panic(err.Error())
	}

	port = os.Getenv("PORT_HTTP")
	if port == "" {
		log.Default().Panic("Wrong .env format")
	}

	// setting 'version' variable

	type packageStruct struct {
		Version string `json:"version"`
	}

	packageContent, err := os.ReadFile("../package.json")
	if err != nil {
		log.Default().Panic(err.Error())
	}

	var packageJSON packageStruct
	err = json.Unmarshal(packageContent, &packageJSON)
	if err != nil {
		log.Default().Panic(err.Error())
	}
	version = packageJSON.Version

	// loading all the templates

	tmpl, err := template.New("").Funcs(template.FuncMap{
		"version": func() string { return version },
	}).ParseGlob("html/*.html")

	if err != nil {
		log.Default().Panic(err.Error())
	}

	// creating the mux

	mux := http.NewServeMux()

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
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
			executeTemplate(w, tmpl.Lookup(lowerPath+".html"), "")
			return
		}

		// serve non html content
		fileContents, err := os.ReadFile("./" + path)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			w.Header().Set("Content-Type", "text/html")
			executeTemplate(w, tmpl.Lookup("404.html"), "")
			return
		}
		w.Write(fileContents)
	})

	// starting the server

	log.Default().Print("Listening on port " + port)
	http.ListenAndServe(":"+port, mux)
}

func executeTemplate(w http.ResponseWriter, tmpl *template.Template, data any) {
	if tmpl == nil {
		http.Error(w, "Template not found", http.StatusNotFound)
		return
	}

	err := tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
	}
}
