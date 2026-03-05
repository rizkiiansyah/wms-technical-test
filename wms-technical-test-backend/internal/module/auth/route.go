package auth

import (
	"wms-technical-test-backend/internal/config"
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
	"wms-technical-test-backend/internal/module/redis"

	"github.com/gofiber/fiber/v2"
)

func Route(route fiber.Router, svc *Service, cfg *config.Config, redisSvc *redis.Service, userProvider authmiddleware.UserProvider) {
	handler := NewHandler(svc)
	auth := route.Group("/auth")

	auth.Post("/login", handler.Login)
	auth.Post("/refresh-token", handler.RefreshToken)
	auth.Post("/logout", authmiddleware.AuthMiddleware(cfg, redisSvc, userProvider), handler.Logout)
	auth.Get("/profile", authmiddleware.AuthMiddleware(cfg, redisSvc, userProvider), handler.Profile)
}
