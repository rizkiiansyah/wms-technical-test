package order

import (
	"wms-technical-test-backend/internal/dto"
	"wms-technical-test-backend/internal/logger"
	"wms-technical-test-backend/internal/response"
	"wms-technical-test-backend/internal/validator"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc}
}

func (h *Handler) List(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Order list start", c)

	page := c.QueryInt("page", 1)
	perPage := c.QueryInt("per_page", 10)
	wmsStatus := c.Query("wms_status")
	filter := ListFilter{
		Page:      page,
		PerPage:   perPage,
		WMSStatus: wmsStatus,
	}
	orders, total, totalPages, err := h.svc.List(filter)
	if err != nil {
		return response.HandleError(c, err)
	}

	meta := dto.BaseResponsePaginationMeta{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
	}

	logger.InfoWithUserEmail("Order list finish", c)

	return response.SuccessWithMetaAndData(c, fiber.StatusOK, meta, orders)
}

func (h *Handler) Detail(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Order detail start", c)

	orderSN := c.Params("order_sn")
	order, err := h.svc.Detail(orderSN)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Order detail finish", c)

	return response.SuccessWithData(c, fiber.StatusOK, order)
}

func (h *Handler) Pick(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Order pick start", c)

	orderSN := c.Params("order_sn")
	order, err := h.svc.Pick(orderSN)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Order pick finish", c)

	return response.Success(c, fiber.StatusOK, "Pick success", order)
}

func (h *Handler) Pack(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Order pack start", c)

	orderSN := c.Params("order_sn")
	order, err := h.svc.Pack(orderSN)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Order pack finish", c)

	return response.Success(c, fiber.StatusOK, "Pack success", order)
}

func (h *Handler) Ship(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Order ship start", c)

	orderSN := c.Params("order_sn")

	var req OrderShipRequest
	if err := c.BodyParser(&req); err != nil {
		return response.ErrorWithMessage(c, fiber.ErrBadRequest.Code, err.Error())
	}
	if err := validator.Validate.Struct(req); err != nil {
		errorsMap := validator.FormatValidationError(err, req)

		return response.ErrorWithMessageAndErrors(c, fiber.ErrBadRequest.Code, "Error input validation", errorsMap)
	}

	order, err := h.svc.Ship(orderSN, req)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Order ship finish", c)

	return response.Success(c, fiber.StatusOK, "Ship success", order)
}
