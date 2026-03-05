package webhook

import (
	"wms-technical-test-backend/internal/logger"
	"wms-technical-test-backend/internal/response"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc}
}

func (h *Handler) UpdateOrderStatus(c *fiber.Ctx) error {
	logger.Info("Webhook update order status start")

	var req UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return response.ErrorWithMessage(c, fiber.ErrBadRequest.Code, err.Error())
	}
	order, err := h.svc.UpdateOrderStatus(req)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.Info("Webhook update order status finish")

	return response.Success(c, fiber.StatusOK, "Update order status success", order)
}

func (h *Handler) UpdateShippingStatus(c *fiber.Ctx) error {
	logger.Info("Webhook update shipping status start")

	var req UpdateShippingStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return response.ErrorWithMessage(c, fiber.ErrBadRequest.Code, err.Error())
	}
	order, err := h.svc.UpdateShippingStatus(req)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.Info("Webhook update shipping status finish")

	return response.Success(c, fiber.StatusOK, "Update shipping status success", order)
}
