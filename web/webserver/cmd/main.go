package main

import (
	"net/http"
	"webserver/configs"
	"webserver/internal/api"
	"webserver/internal/db"
	"webserver/internal/logger"
	"webserver/internal/templates"
)

func main() {

	configs.LoadConfig()
	logger.Init(configs.Cfg.AppEnv == "production")

	logger.Log.Infof("starting webserver...")
	logger.Log.Infof("- pyro version: %s", configs.Cfg.Version)
	logger.Log.Infof("- mode: %s", configs.Cfg.AppEnv)
	logger.Log.Infof("- listen addr: %s", configs.Cfg.HttpAddr)

	db.Connect()
	defer db.DB.Close()

	templates.LoadTemplates()

	mux := http.NewServeMux()
	api.RegisterRoutes(mux)

	logger.Log.Infof("listening...")
	err := http.ListenAndServe(configs.Cfg.HttpAddr, mux)
	if err != nil {
		logger.Log.Panic(err)
	}
}
