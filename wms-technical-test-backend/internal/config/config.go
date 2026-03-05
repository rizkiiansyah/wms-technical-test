package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port string

	DBHost    string
	DBPort    string
	DBUser    string
	DBPass    string
	DBName    string
	DBSSLMode string

	JWTSecret string

	RedisAddr   string
	RedisPass   string
	RedisDB     string
	RedisPrefix string

	MarketplaceApiUrl     string
	MarketplaceShopID     string
	MarketplacePartnerID  string
	MarketplacePartnerKey string
}

func Load() *Config {
	_ = godotenv.Load()

	dbHost := get("DB_HOST", "localhost")

	return &Config{
		Port: get("APP_PORT", "8080"),

		DBHost:    dbHost,
		DBPort:    get("DB_PORT", "5432"),
		DBUser:    get("DB_USER", "postgres"),
		DBPass:    get("DB_PASS", "postgres"),
		DBName:    get("DB_NAME", "appdb"),
		DBSSLMode: get("DB_SSL_MODE", getDBSSLMode(dbHost)),

		JWTSecret: get("JWT_SECRET", ""),

		RedisAddr:   get("REDIS_ADDR", "localhost:6379"),
		RedisPass:   get("REDIS_PASS", "admin"),
		RedisDB:     get("REDIS_DB", "0"),
		RedisPrefix: get("REDIS_PREFIX", ""),

		MarketplaceApiUrl:     get("MARKETPLACE_API_URL", ""),
		MarketplaceShopID:     get("MARKETPLACE_SHOP_ID", ""),
		MarketplacePartnerID:  get("MARKETPLACE_PARTNER_ID", ""),
		MarketplacePartnerKey: get("MARKETPLACE_PARTNER_KEY", ""),
	}
}

func get(k, d string) string {
	if v, ok := os.LookupEnv(k); ok {
		return v
	}
	return d
}

func getDBSSLMode(dbHost string) string {
	if v, ok := os.LookupEnv("DB_SSL_MODE"); ok {
		return v
	}

	host := strings.ToLower(strings.TrimSpace(dbHost))
	switch host {
	case "localhost", "127.0.0.1", "::1", "":
		return "disable"
	default:
		return "require"
	}
}
