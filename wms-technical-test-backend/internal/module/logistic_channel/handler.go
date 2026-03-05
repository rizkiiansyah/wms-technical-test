package logisticchannel

import (
	"wms-technical-test-backend/internal/response"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc}
}

func (h *Handler) Dropdown(c *fiber.Ctx) error {
	logisticChannels, err := h.svc.Dropdown()
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.SuccessWithData(c, fiber.StatusOK, logisticChannels)
}
