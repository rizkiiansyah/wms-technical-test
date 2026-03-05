package redis

import (
	"context"
	"log"
	"strconv"
	"time"
	"wms-technical-test-backend/internal/config"

	"github.com/redis/go-redis/v9"
)

func NewRedisClient(cfg *config.Config) (*redis.Client, context.Context) {
	redisDb, err := strconv.Atoi(cfg.RedisDB)
	if err != nil {
		panic("Redis DB must be a number")
	}

	ctx := context.Background()
	rdb := redis.NewClient(&redis.Options{
		Addr:         cfg.RedisAddr,
		Password:     cfg.RedisPass,
		DB:           redisDb,
		PoolSize:     10,
		MinIdleConns: 5,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to connect to redis: %v", err)
	} else {
		log.Println("Redis connected")
	}

	return rdb, ctx
}
