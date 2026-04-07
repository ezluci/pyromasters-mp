package configs

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Version   string
	AppEnv    string
	PortHttp  string
	DBName    string
	DBHost    string
	DBUser    string
	DBPass    string
	JWTSecret string
}

var Cfg Config

func LoadConfig() {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Fatal(err)
	}

	versionByte, err := os.ReadFile("../../VERSION")
	if err != nil {
		log.Fatal(err)
	}
	version := string(versionByte)

	Cfg = Config{
		Version:   version,
		AppEnv:    os.Getenv("APP_ENV"),
		PortHttp:  os.Getenv("PORT_HTTP"),
		DBName:    os.Getenv("DB_NAME"),
		DBHost:    os.Getenv("DB_PORT"),
		DBUser:    os.Getenv("DB_USER"),
		DBPass:    os.Getenv("DB_PASS"),
		JWTSecret: os.Getenv("JWT_SECRET"),
	}
}

func getEnv(key string) string {
	if val, exists := os.LookupEnv(key); exists {
		return val
	}
	log.Fatal("key " + key + " not found in .env")
	return ""
}
