package templates

import (
	"html/template"
	"webserver/configs"
	"webserver/internal/logger"
)

var Templates *template.Template

var requiredTemplates = []string{
	"index",
	"footer",
	"404",
	"gamemobile",
	"gamepc",
	"topbar",
	"profile",
}

func LoadTemplates() {
	var err error
	Templates, err = template.New("").Funcs(template.FuncMap{
		"version": func() string { return configs.Cfg.Version },
	}).ParseGlob("../public/*.html")

	if err != nil {
		logger.Log.Fatal(err.Error())
	}

	for _, t := range requiredTemplates {
		if Templates.Lookup(t+".html") == nil {
			logger.Log.Fatalf("template %s not found", t)
		}
	}
}

func nonProdLookup(name string) *template.Template {
	tmpl, err := template.New(name+".html").ParseFiles(
		"../public/"+name+".html",
		"../public/footer.html",
		"../public/topbar.html",
	)
	if err != nil {
		logger.Log.Panicf("cant parse template: %v", err)
		return nil
	}
	return tmpl
}

func Lookup(name string) *template.Template {
	if configs.Cfg.AppEnv != "production" {
		return nonProdLookup(name)
	} else {
		return Templates.Lookup(name + ".html")
	}
}
