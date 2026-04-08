package api

import (
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"
	"webserver/configs"
	"webserver/internal/templates"

	"github.com/golang-jwt/jwt/v5"
)

type PageData struct {
	IsLoggedIn bool
	Username   string
	AppEnv     string
}

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

		var tmpl *template.Template
		// var err error
		// if configs.Cfg.AppEnv != "production" {
		// 	tmpl, err = template.New("").Funcs(
		// 		template.FuncMap{
		// 			"version": func() string { return configs.Cfg.Version },
		// 		}).ParseFiles("../public/" + lowerPath + ".html")
		// 	if err != nil {
		// 		log.Panicf("cant find %s template", lowerPath)
		// 		return
		// 	}
		// } else {
		tmpl = templates.Templates.Lookup(lowerPath + ".html")
		// }

		data := PageData{
			IsLoggedIn: false,
			AppEnv:     configs.Cfg.AppEnv,
		}

		cookie, err := r.Cookie("jwt_token")
		if err == nil {
			jwtTokenEncoded := cookie.Value
			jwtToken, err := jwt.Parse(jwtTokenEncoded, func(token *jwt.Token) (any, error) {
				return []byte(configs.Cfg.JWTSecret), nil
			}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

			if err != nil {
				writeJSON(w, http.StatusInternalServerError, ErrorResponse{
					Error: "cant decode token",
				})
				return
			}

			claims, ok := jwtToken.Claims.(jwt.MapClaims)
			if ok && jwtToken.Valid {
				data.IsLoggedIn = true
				data.Username = claims["username"].(string)
			}
		}

		if err := tmpl.Execute(w, data); err != nil {
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{
				Error: "cant execute template",
			})
			return
		}
		return
	}

	// serve non html content
	fileContents, err := os.ReadFile("../public/" + path)

	if err != nil {
		tmpl := templates.Templates.Lookup("404.html")
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusNotFound)

		if err := tmpl.Execute(w, ""); err != nil {
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{
				Error: "cant execute 404 template",
			})
			return
		}
		return
	}
	w.Write(fileContents)
}
