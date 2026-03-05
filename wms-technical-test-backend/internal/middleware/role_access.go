package middleware

import (
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
	roleaccess "wms-technical-test-backend/internal/module/role_access"
	"wms-technical-test-backend/internal/response"

	"github.com/gofiber/fiber/v2"
)

func RoleAccessMiddleware(roleAccessSvc *roleaccess.Service, allowedRoleAccessKeys ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		user, ok := c.Locals("user").(*authmiddleware.User)
		if !ok {
			return response.ErrorWithMessage(c, fiber.ErrInternalServerError.Code, fiber.ErrInternalServerError.Message)
		}

		roleAccesses, err := roleAccessSvc.FindByRoleIDAndKeys(user.RoleID, allowedRoleAccessKeys)
		if err != nil {
			return response.ErrorWithMessage(c, fiber.ErrNotFound.Code, "Error get role access")
		}

		if len(roleAccesses) > 0 {
			return c.Next()
		}

		return response.ErrorWithMessage(c, fiber.ErrForbidden.Code, "Access denied")
	}
}
