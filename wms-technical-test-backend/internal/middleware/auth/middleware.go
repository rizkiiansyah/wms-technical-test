package auth

import (
	"errors"
	"fmt"
	"strings"
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/logger"
	"wms-technical-test-backend/internal/module/redis"
	"wms-technical-test-backend/internal/response"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

func AuthMiddleware(cfg *config.Config, redisSvc *redis.Service, userProvider UserProvider) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Missing authorization header")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Invalid authorization format")
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Unexpected signing method")
			}

			return []byte(cfg.JWTSecret), nil
		})

		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) {
				return response.Error(c, fiber.ErrUnauthorized.Code, "Access access token expired", map[string]interface{}{
					"error_type": "access_token_expired",
				})
			} else if errors.Is(err, jwt.ErrTokenSignatureInvalid) {
				return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Invalid access token signature")
			} else if errors.Is(err, jwt.ErrTokenMalformed) {
				return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Malformed access token")
			}
			logger.Error("Auth jwt parse", err)

			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Invalid access token")
		}
		if !token.Valid {
			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Invalid or expired access token")
		}

		result, err := redisSvc.IsAccessTokenRevoked(tokenStr)
		if err != nil {
			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Error check access token revoked")
		} else if result {
			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Access token revoked")
		}

		var userIDSub float64
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userIDSub, ok = claims["sub"].(float64)
			if !ok {
				return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "Error get sub claim")
			}
		}

		userID := uint64(userIDSub)
		user, err := userProvider.FindAuthByID(userID)
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.ErrorWithMessage(c, fiber.ErrUnauthorized.Code, "User not found")
		} else if err != nil {
			return response.ErrorWithMessage(c, fiber.ErrInternalServerError.Code, "Something went wrong")
		}

		c.Locals("user", user)
		c.Locals("data", map[string]interface{}{
			"user_email": user.Email,
		})
		c.Locals("access_token", tokenStr)

		return c.Next()
	}
}
