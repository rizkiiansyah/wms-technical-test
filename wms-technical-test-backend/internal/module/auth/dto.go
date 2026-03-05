package auth

import (
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
	roleaccess "wms-technical-test-backend/internal/module/role_access"
	"wms-technical-test-backend/internal/module/user"
)

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	User         user.User `json:"user"`
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
}

type RefreshTokenRequest struct {
	AccessToken  string `json:"access_token" validate:"required"`
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type RefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type ProfileResponse struct {
	User         authmiddleware.User     `json:"user"`
	RoleAccesses []roleaccess.RoleAccess `json:"role_accesses"`
}
