package webhook

import "github.com/gofiber/fiber/v2"

func Route(route fiber.Router, svc *Service) {
	handler := NewHandler(svc)
	webhook := route.Group("/webhook")

	webhook.Post("/order-status", handler.UpdateOrderStatus)
	webhook.Post("/shipping-status", handler.UpdateShippingStatus)
}
