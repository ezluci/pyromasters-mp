package api

import (
	"html/template"
	"net/http"
	"strconv"
	"strings"
	"webserver/configs"
	"webserver/internal/logger"
	"webserver/internal/templates"

	"github.com/golang-jwt/jwt/v5"
)

type PageData struct {
	AppEnv     string
	IsLoggedIn bool
	Username   string
	UserID     int
	SocketUrl  string
	Secure     bool
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
		w.Header().Set("Content-Type", "text/html")
		if lowerPath == "" {
			lowerPath = "index"
		}

		var tmpl *template.Template
		var err error
		if configs.Cfg.AppEnv != "production" {
			tmpl, err = template.New(lowerPath+".html").Funcs(
				template.FuncMap{
					"version": func() string { return configs.Cfg.Version },
				}).ParseFiles(
				"../public/"+lowerPath+".html",
				"../public/footer.html",
				"../public/topbar.html",
			)
			if err != nil {
				logger.Log.Panicf("cant parse template: %v", err)
				return
			}
		} else {
			tmpl = templates.Templates.Lookup(lowerPath + ".html")
		}

		data := PageData{
			AppEnv:     configs.Cfg.AppEnv,
			IsLoggedIn: false,
			SocketUrl:  configs.Cfg.SocketUrl,
		}

		cookie, err := r.Cookie("jwt_token")
		if err == nil {
			jwtTokenEncoded := cookie.Value
			jwtToken, err := jwt.Parse(jwtTokenEncoded, func(token *jwt.Token) (any, error) {
				return []byte(configs.Cfg.JWTSecret), nil
			}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

			if err == nil {
				claims, ok := jwtToken.Claims.(jwt.MapClaims)

				if ok && jwtToken.Valid {
					data.Username, _ = claims["username"].(string)
					userID, _ := claims["user_id"].(string)
					data.UserID, _ = strconv.Atoi(userID)
					data.IsLoggedIn = true
				}
			}
		}

		if err := tmpl.Execute(w, data); err != nil {
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{
				Error: "cant execute template ",
			})
			return
		}
		return
	}

	// serve non html content
	http.FileServer(http.Dir("../public")).ServeHTTP(w, r)
}
