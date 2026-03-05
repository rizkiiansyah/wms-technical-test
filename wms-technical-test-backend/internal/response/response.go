package response

import (
	"errors"
	dto "wms-technical-test-backend/internal/dto"
	"wms-technical-test-backend/internal/errs"

	"github.com/gofiber/fiber/v2"
)

func Success(c *fiber.Ctx, code int, message string, data interface{}) error {
	return c.Status(code).JSON(dto.BaseResponse{
		Code:    code,
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

func SuccessWithMessage(c *fiber.Ctx, code int, message string) error {
	return c.Status(code).JSON(dto.BaseResponseWithMessage{
		Code:    code,
		Status:  "success",
		Message: message,
	})
}

func SuccessWithData(c *fiber.Ctx, code int, data interface{}) error {
	return c.Status(code).JSON(dto.BaseResponseWithData{
		Code:   code,
		Status: "success",
		Data:   data,
	})
}

func SuccessWithMetaAndData(c *fiber.Ctx, code int, meta, data interface{}) error {
	return c.Status(code).JSON(dto.BaseResponseWithDataAndMeta{
		Code:   code,
		Status: "success",
		Meta:   meta,
		Data:   data,
	})
}

func Error(c *fiber.Ctx, code int, message string, data interface{}) error {
	return c.Status(code).JSON(dto.BaseResponse{
		Code:    code,
		Status:  "error",
		Message: message,
		Data:    data,
	})
}

func ErrorWithMessage(c *fiber.Ctx, code int, message string) error {
	return c.Status(code).JSON(dto.BaseResponseWithMessage{
		Code:    code,
		Status:  "error",
		Message: message,
	})
}

func ErrorWithData(c *fiber.Ctx, code int, data interface{}) error {
	return c.Status(code).JSON(dto.BaseResponseWithData{
		Code:   code,
		Status: "error",
		Data:   data,
	})
}

func ErrorWithMessageAndErrors(c *fiber.Ctx, code int, message string, errors interface{}) error {
	return c.Status(code).JSON(dto.BaseResponseWithMessageAndErrors{
		Code:    code,
		Status:  "error",
		Message: message,
		Errors:  errors,
	})
}

func HandleError(c *fiber.Ctx, err error) error {
	if err == nil {
		return nil
	}

	var appErr *errs.AppError
	if errors.As(err, &appErr) {
		return Error(c, appErr.Code, appErr.Message, appErr.Data)
	}

	return ErrorWithMessage(
		c,
		fiber.ErrInternalServerError.Code,
		fiber.ErrInternalServerError.Message,
	)
}
