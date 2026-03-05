package auth

import (
	"errors"
	"wms-technical-test-backend/internal/errs"
	"wms-technical-test-backend/internal/logger"
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
	"wms-technical-test-backend/internal/module/redis"
	roleaccess "wms-technical-test-backend/internal/module/role_access"
	"wms-technical-test-backend/internal/module/user"
	"wms-technical-test-backend/internal/util"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	userSvc       *user.Service
	jwtUtl        *util.Jwt
	redisSvc      *redis.Service
	roleAccessSvc *roleaccess.Service
}

func NewService(userSvc *user.Service, jwtUtl *util.Jwt, redisSvc *redis.Service, roleAccessSvc *roleaccess.Service) *Service {
	return &Service{userSvc, jwtUtl, redisSvc, roleAccessSvc}
}

func (s *Service) Login(req LoginRequest) (*LoginResponse, error) {
	user, err := s.userSvc.FindByEmail(req.Email)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Invalid credentials")
	} else if err != nil {
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		logger.Error("Compare hash password", err)

		return nil, errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Invalid credentials")
	}

	accessToken, err := s.jwtUtl.GenerateAccessToken(user.ID)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error generate access token")
	}

	refreshToken, err := s.jwtUtl.GenerateRefreshToken(user.ID)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error generate refresh token")
	}

	err = s.redisSvc.AddAccessTokenRefreshToken(accessToken, refreshToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error add access token and refresh token")
	}

	return &LoginResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) RefreshToken(req RefreshTokenRequest) (*RefreshTokenResponse, error) {
	result, err := s.redisSvc.IsAccessTokenRevoked(req.AccessToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Error check access token revoked")
	} else if result {
		return nil, errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Access token revoked")
	}

	sub, err := s.jwtUtl.ExtractSub(req.AccessToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error extract sub in access token")
	}

	userID := uint64(*sub)

	result, err = s.redisSvc.IsRefreshTokenRevoked(req.RefreshToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Error check access token revoked")
	} else if result {
		return nil, errs.NewWithMessage(fiber.ErrUnauthorized.Code, "Refresh token revoked")
	}

	newAccessToken, err := s.jwtUtl.GenerateAccessToken(userID)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error generate access token")
	}

	newRefreshToken, err := s.jwtUtl.GenerateRefreshToken(userID)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error generate refresh token")
	}

	err = s.redisSvc.AddAccessTokenRefreshToken(newAccessToken, newRefreshToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error add access token and refresh token")
	}

	err = s.redisSvc.AddRevokeAccessToken(req.AccessToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error revoke access token")
	}

	err = s.redisSvc.AddRevokeRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error revoke refresh token")
	}

	return &RefreshTokenResponse{
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *Service) Logout(accessToken string) error {
	refreshToken, err := s.redisSvc.GetValueRefreshToken(accessToken)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errs.NewWithMessage(fiber.ErrNotFound.Code, "Refresh token not found")
	} else if err != nil {
		return errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get refresh token")
	}

	err = s.redisSvc.AddRevokeAccessToken(accessToken)
	if err != nil {
		return errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error revoke access token")
	}

	err = s.redisSvc.AddRevokeRefreshToken(*refreshToken)
	if err != nil {
		return errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error revoke refresh token")
	}

	return nil
}

func (s *Service) Profile(accessToken string, user *authmiddleware.User) (*ProfileResponse, error) {
	roleAccesses, err := s.roleAccessSvc.FindAllByRoleID(user.RoleID)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get role access list")
	}

	return &ProfileResponse{
		User:         *user,
		RoleAccesses: roleAccesses,
	}, nil
}
