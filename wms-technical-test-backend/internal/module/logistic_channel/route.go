package logisticchannel

import (
	"wms-technical-test-backend/internal/config"
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
	"wms-technical-test-backend/internal/module/redis"
	roleaccess "wms-technical-test-backend/internal/module/role_access"

	"github.com/gofiber/fiber/v2"
)

func Route(route fiber.Router, svc *Service, cfg *config.Config, roleAccessSvc *roleaccess.Service, redisSvc *redis.Service, userProvider authmiddleware.UserProvider) {
	handler := NewHandler(svc)
	logisticChannel := route.Group("/logistic-channels", authmiddleware.AuthMiddleware(cfg, redisSvc, userProvider))

	logisticChannel.Get("/dropdown", handler.Dropdown)
}
