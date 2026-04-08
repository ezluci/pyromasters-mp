package configs

import (
	"os"
	"webserver/internal/logger"

	"github.com/joho/godotenv"
)

type Config struct {
	Version    string
	AppEnv     string
	PortHttp   string
	PortSocket string
	DBName     string
	DBHost     string
	DBUser     string
	DBPass     string
	JWTSecret  string
}

var Cfg Config

func LoadConfig() {
	if err := godotenv.Load("../../.env"); err != nil {
		logger.Log.Fatal(err)
	}

	versionByte, err := os.ReadFile("../../VERSION")
	if err != nil {
		logger.Log.Fatal(err)
	}
	version := string(versionByte)

	Cfg = Config{
		Version:    version,
		AppEnv:     getEnv("APP_ENV"),
		PortHttp:   getEnv("PORT_HTTP"),
		PortSocket: getEnv("PORT_SOCKET"),
		DBName:     getEnv("DB_NAME"),
		DBHost:     getEnv("DB_HOST"),
		DBUser:     getEnv("DB_USER"),
		DBPass:     getEnv("DB_PASS"),
		JWTSecret:  getEnv("JWT_SECRET"),
	}
}

func getEnv(key string) string {
	if val, exists := os.LookupEnv(key); exists {
		return val
	}
	logger.Log.Fatal("key ", key, " not found in .env")
	return ""
}
