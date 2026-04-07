package templates

import (
	"html/template"
	"log"
	"webserver/configs"
)

var Templates *template.Template

var requiredTemplates = []string{
	"index",
	"footer",
	"404",
	"gamemobile",
	"gamepc",
}

func LoadTemplates() {
	var err error
	Templates, err = template.New("").Funcs(template.FuncMap{
		"version": func() string { return configs.Cfg.Version },
	}).ParseGlob("../public/*.html")

	if err != nil {
		log.Fatal(err.Error())
	}

	for _, t := range requiredTemplates {
		if Templates.Lookup(t+".html") == nil {
			log.Fatalf("template %s not found", t)
		}
	}
}
