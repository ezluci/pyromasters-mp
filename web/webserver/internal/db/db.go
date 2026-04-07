package db

import (
	"database/sql"
	"fmt"
	"log"
	"webserver/configs"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Connect() {
	name := configs.Cfg.DBName
	host := configs.Cfg.DBHost
	user := configs.Cfg.DBUser
	pass := configs.Cfg.DBPass

	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true", user, pass, host, name)
	var err error
	if DB, err = sql.Open("mysql", dsn); err != nil {
		log.Fatal(err.Error())
	}
}
