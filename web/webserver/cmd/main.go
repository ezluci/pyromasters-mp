package main

import (
	"log"
	"net/http"
	"webserver/configs"
	"webserver/internal/api"
	"webserver/internal/db"
	"webserver/internal/templates"
)

func main() {

	configs.LoadConfig()

	log.Default().Print("starting webserver...")
	log.Default().Printf("- pyro version: %s", configs.Cfg.Version)
	log.Default().Printf("- mode: %s", configs.Cfg.AppEnv)
	log.Default().Printf("- port: %s", configs.Cfg.PortHttp)

	db.Connect()
	defer db.DB.Close()

	templates.LoadTemplates()

	mux := http.NewServeMux()
	api.RegisterRoutes(mux)

	log.Default().Print("listening...")
	err := http.ListenAndServe(":"+configs.Cfg.PortHttp, mux)
	if err != nil {
		log.Panic(err)
	}
}
