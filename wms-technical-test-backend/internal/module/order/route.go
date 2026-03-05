package order

import (
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/middleware"
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
	"wms-technical-test-backend/internal/module/redis"
	roleaccess "wms-technical-test-backend/internal/module/role_access"

	"github.com/gofiber/fiber/v2"
)

func Route(route fiber.Router, svc *Service, cfg *config.Config, roleAccessSvc *roleaccess.Service, redisSvc *redis.Service, userProvider authmiddleware.UserProvider) {
	handler := NewHandler(svc)
	order := route.Group("/orders", authmiddleware.AuthMiddleware(cfg, redisSvc, userProvider))

	order.Get("/", middleware.RoleAccessMiddleware(roleAccessSvc, "orders.list"), handler.List)
	order.Get("/:order_sn", middleware.RoleAccessMiddleware(roleAccessSvc, "orders.detail"), handler.Detail)
	order.Post("/:order_sn/pick", middleware.RoleAccessMiddleware(roleAccessSvc, "orders.pick"), handler.Pick)
	order.Post("/:order_sn/pack", middleware.RoleAccessMiddleware(roleAccessSvc, "orders.pack"), handler.Pack)
	order.Post("/:order_sn/ship", middleware.RoleAccessMiddleware(roleAccessSvc, "orders.ship"), handler.Ship)
}
