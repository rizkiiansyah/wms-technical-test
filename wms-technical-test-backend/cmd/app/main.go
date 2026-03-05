package main

import (
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/database"
	"wms-technical-test-backend/internal/redis"
	"wms-technical-test-backend/internal/server"
	"wms-technical-test-backend/internal/util"
)

func main() {
	util.InitTimezone()

	config := config.Load()
	redisClient, ctx := redis.NewRedisClient(config)

	database.Connect(config)
	server.Run(config, redisClient, ctx)
}
