package auth

import (
	"wms-technical-test-backend/internal/logger"
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
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

func (h *Handler) Login(c *fiber.Ctx) error {
	logger.Info("Auth login start")

	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.ErrorWithMessage(c, fiber.ErrBadRequest.Code, err.Error())
	}
	if err := validator.Validate.Struct(req); err != nil {
		errorsMap := validator.FormatValidationError(err, req)

		return response.ErrorWithMessageAndErrors(c, fiber.ErrBadRequest.Code, fiber.ErrBadRequest.Error(), errorsMap)
	}

	result, err := h.svc.Login(req)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.Info("Auth login finish")

	return response.Success(c, fiber.StatusOK, "Login success", result)
}

func (h *Handler) RefreshToken(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Auth login start", c)

	var req RefreshTokenRequest
	if err := c.BodyParser(&req); err != nil {
		return response.ErrorWithMessage(c, fiber.ErrBadRequest.Code, err.Error())
	}
	if err := validator.Validate.Struct(req); err != nil {
		errorsMap := validator.FormatValidationError(err, req)

		return response.ErrorWithMessageAndErrors(c, fiber.ErrBadRequest.Code, fiber.ErrBadRequest.Error(), errorsMap)
	}

	result, err := h.svc.RefreshToken(req)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Auth login start", c)

	return response.SuccessWithData(c, fiber.StatusOK, result)
}

func (h *Handler) Logout(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Auth logout start", c)

	accessToken, ok := c.Locals("access_token").(string)
	if !ok {
		return response.ErrorWithMessage(c, fiber.ErrInternalServerError.Code, fiber.ErrInternalServerError.Message)
	}

	err := h.svc.Logout(accessToken)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Auth logout finish", c)

	return response.SuccessWithMessage(c, fiber.StatusOK, "Logout success")
}

func (h *Handler) Profile(c *fiber.Ctx) error {
	logger.InfoWithUserEmail("Auth profile start", c)

	accessToken, ok := c.Locals("access_token").(string)
	if !ok {
		return response.ErrorWithMessage(c, fiber.ErrInternalServerError.Code, fiber.ErrInternalServerError.Message)
	}
	user, ok := c.Locals("user").(*authmiddleware.User)
	if !ok {
		return response.ErrorWithMessage(c, fiber.ErrInternalServerError.Code, fiber.ErrInternalServerError.Message)
	}

	result, err := h.svc.Profile(accessToken, user)
	if err != nil {
		return response.HandleError(c, err)
	}

	logger.InfoWithUserEmail("Auth profile finish", c)

	return response.SuccessWithData(c, fiber.StatusOK, result)
}
