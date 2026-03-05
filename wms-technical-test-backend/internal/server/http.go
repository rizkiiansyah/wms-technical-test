package server

import (
	"context"
	"fmt"
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/module/auth"
	logisticchannel "wms-technical-test-backend/internal/module/logistic_channel"
	marketplaceapi "wms-technical-test-backend/internal/module/marketplace_api"
	"wms-technical-test-backend/internal/module/order"
	moduleredis "wms-technical-test-backend/internal/module/redis"
	roleaccess "wms-technical-test-backend/internal/module/role_access"
	"wms-technical-test-backend/internal/module/user"
	"wms-technical-test-backend/internal/module/webhook"
	"wms-technical-test-backend/internal/route"
	"wms-technical-test-backend/internal/scheduler"
	"wms-technical-test-backend/internal/util"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/redis/go-redis/v9"
)

func Run(cfg *config.Config, rdb *redis.Client, ctx context.Context) {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Content-Type,Authorization",
	}))

	jwtUtl := util.NewJwt(cfg)

	redisSvc := moduleredis.NewService(rdb, ctx, cfg, jwtUtl)
	roleRepo := roleaccess.NewRepository()
	orderRepo := order.NewRepository()
	logisticChannelRepo := logisticchannel.NewRepository()
	userRepo := user.NewRepository()

	marketplaceApiSvc := marketplaceapi.NewService(redisSvc, cfg)
	roleAccessSvc := roleaccess.NewService(roleRepo, cfg)
	orderSvc := order.NewService(orderRepo, marketplaceApiSvc)
	logisticChannelSvc := logisticchannel.NewService(logisticChannelRepo)
	webhookSvc := webhook.NewService(orderSvc)
	userSvc := user.NewService(userRepo)
	authSvc := auth.NewService(userSvc, jwtUtl, redisSvc, roleAccessSvc)

	scheduler.Run(marketplaceApiSvc, orderSvc, logisticChannelSvc)

	route.Load(app, cfg, orderSvc, roleAccessSvc, webhookSvc, logisticChannelSvc, authSvc, redisSvc, userSvc)

	app.Listen(fmt.Sprintf(":%s", cfg.Port))
}
