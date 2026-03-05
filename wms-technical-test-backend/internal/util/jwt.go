package util

import (
	"fmt"
	"strings"
	"time"
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/logger"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Jwt struct {
	cfg *config.Config
}

var revokeAccessTokenValidity = time.Hour * 2   // 2 hours
var revokeRefreshTokenValidity = time.Hour * 24 // 24 hours

func NewJwt(cfg *config.Config) *Jwt {
	return &Jwt{cfg}
}

func (s *Jwt) GenerateAccessToken(ID uint64) (string, error) {
	jti := uuid.New().String()
	claims := jwt.MapClaims{
		"sub": ID,
		"jti": jti,
		"exp": time.Now().Add(revokeAccessTokenValidity).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessTokenStr, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		logger.Error("Generate access token error: ", err)
	}

	return accessTokenStr, err
}

func (s *Jwt) GenerateRefreshToken(ID uint64) (string, error) {
	jti := uuid.New().String()
	claims := jwt.MapClaims{
		"sub": ID,
		"jti": jti,
		"exp": time.Now().Add(revokeRefreshTokenValidity).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	refreshTokenStr, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		logger.Error("Generate refresh token error: ", err)
	}

	return refreshTokenStr, err
}

func ExtractBearerToken(authHeader string) string {
	if after, ok := strings.CutPrefix(authHeader, "Bearer "); ok {
		return after
	}

	return ""
}

func (s *Jwt) ExtractJTI(tokenString string) (*string, error) {
	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		logger.Error("Extract jti parse with claims", err)

		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if jti, ok := claims["jti"].(string); ok {
			return &jti, nil
		}
	}

	return nil, fmt.Errorf("JTI not found")
}

func (s *Jwt) ExtractSub(tokenString string) (*float64, error) {
	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		logger.Error("Extract sub parse with claims", err)

		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if jti, ok := claims["sub"].(float64); ok {
			return &jti, nil
		}
	}

	return nil, fmt.Errorf("Sub not found")
}
