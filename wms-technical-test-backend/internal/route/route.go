package route

import (
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/module/auth"
	logisticchannel "wms-technical-test-backend/internal/module/logistic_channel"
	"wms-technical-test-backend/internal/module/order"
	"wms-technical-test-backend/internal/module/redis"
	roleaccess "wms-technical-test-backend/internal/module/role_access"
	"wms-technical-test-backend/internal/module/user"
	"wms-technical-test-backend/internal/module/webhook"

	"github.com/gofiber/fiber/v2"
)

func Load(app *fiber.App, cfg *config.Config, orderSvc *order.Service, roleAccessSvc *roleaccess.Service, webhookSvc *webhook.Service, logisticChannelSvc *logisticchannel.Service, authSvc *auth.Service, redisSvc *redis.Service, userSvc *user.Service) {
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Hello World",
		})
	})

	api := app.Group("/api")
	v1 := api.Group("/v1")

	order.Route(v1, orderSvc, cfg, roleAccessSvc, redisSvc, userSvc)
	webhook.Route(v1, webhookSvc)
	logisticchannel.Route(v1, logisticChannelSvc, cfg, roleAccessSvc, redisSvc, userSvc)
	auth.Route(v1, authSvc, cfg, redisSvc, userSvc)
}
