package marketplaceapi

import (
	"errors"
	"wms-technical-test-backend/internal/errs"

	"github.com/gofiber/fiber/v2"
)

func GetError(err error) error {
	if errors.Is(err, fiber.ErrUnauthorized) {
		return errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Marketplace api error unauthorized")
	} else if errors.Is(err, fiber.ErrTooManyRequests) {
		return errs.NewWithMessage(fiber.ErrTooManyRequests.Code, "Marketplace api error too many requests")
	} else if errors.Is(err, fiber.ErrInternalServerError) {
		return errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Marketplace api error internal server error")
	} else {
		return errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Marketplace api error something went wrong")
	}
}
