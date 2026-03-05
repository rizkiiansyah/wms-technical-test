package redis

import (
	"context"
	"fmt"
	"time"
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/logger"
	"wms-technical-test-backend/internal/util"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

var refreshTokenValidity = time.Second * 300    // 5 menit
var accessTokenValidity = time.Second * 300     // 5 menit
var revokeAccessTokenValidity = time.Hour * 2   // 2 hours
var revokeRefreshTokenValidity = time.Hour * 24 // 24 hours

type Service struct {
	client *redis.Client
	ctx    context.Context
	cfg    *config.Config
	jwtUtl *util.Jwt
}

func NewService(client *redis.Client, ctx context.Context, cfg *config.Config, jwtUtl *util.Jwt) *Service {
	return &Service{client, ctx, cfg, jwtUtl}
}

func (s *Service) GetMarketplaceApiAuthCode() string {
	key := s.cfg.RedisPrefix + ":marketplace-api:auth-code"
	result, err := s.client.Get(s.ctx, key).Result()
	if err == redis.Nil {
		return ""
	}

	return result
}

func (s *Service) GetMarketplaceApiAccessToken() *string {
	key := s.cfg.RedisPrefix + ":marketplace-api:access-token"
	result, err := s.client.Get(s.ctx, key).Result()
	if err == redis.Nil {
		return nil
	}

	return &result
}

func (s *Service) GetMarketplaceApiRefreshToken() *string {
	key := s.cfg.RedisPrefix + ":marketplace-api:refresh-token"
	result, err := s.client.Get(s.ctx, key).Result()
	if err == redis.Nil {
		return nil
	}

	return &result
}

func (s *Service) SetMarketplaceApiAuthCode(code string) error {
	key := s.cfg.RedisPrefix + ":marketplace-api:auth-code"

	return s.client.Set(s.ctx, key, code, refreshTokenValidity).Err()
}

func (s *Service) SetMarketplaceApiAccessToken(token string) error {
	key := s.cfg.RedisPrefix + ":marketplace-api:access-token"

	return s.client.Set(s.ctx, key, token, refreshTokenValidity).Err()
}

func (s *Service) SetMarketplaceApiRefreshToken(token string) error {
	key := s.cfg.RedisPrefix + ":marketplace-api:refresh-token"

	return s.client.Set(s.ctx, key, token, accessTokenValidity).Err()
}

func (s *Service) IsAccessTokenRevoked(token string) (bool, error) {
	jti, err := s.jwtUtl.ExtractJTI(token)
	if err != nil {
		return false, err
	}

	key := s.cfg.RedisPrefix + ":revoked-access-token:" + *jti
	count, err := s.client.Exists(s.ctx, key).Result()
	if err != nil {
		logger.Error("Redis is access token revoked", err)
	}

	return count > 0, err
}

func (s *Service) IsRefreshTokenRevoked(token string) (bool, error) {
	jti, err := s.jwtUtl.ExtractJTI(token)
	if err != nil {
		return false, err
	}

	key := s.cfg.RedisPrefix + ":revoked-refresh-token:" + *jti
	count, err := s.client.Exists(s.ctx, key).Result()

	return count > 0, err
}

func (s *Service) AddAccessTokenRefreshToken(accessToken, refreshToken string) error {
	accessTokenJTI, err := s.jwtUtl.ExtractJTI(accessToken)
	if err != nil {
		return err
	}

	refreshTokenJTI, err := s.jwtUtl.ExtractJTI(refreshToken)
	if err != nil {
		return err
	}

	key := s.cfg.RedisPrefix + ":access-token:" + *accessTokenJTI + ":refresh-token:" + *refreshTokenJTI

	return s.client.Set(s.ctx, key, refreshToken, revokeAccessTokenValidity).Err()
}

func (s *Service) CheckAccessTokenRefreshToken(accessToken, refreshToken string) (bool, error) {
	accessTokenJTI, err := s.jwtUtl.ExtractJTI(accessToken)
	if err != nil {
		return false, err
	}

	refreshTokenJTI, err := s.jwtUtl.ExtractJTI(refreshToken)
	if err != nil {
		return false, err
	}

	key := s.cfg.RedisPrefix + ":access-token:" + *accessTokenJTI + ":refresh-token:" + *refreshTokenJTI
	count, err := s.client.Exists(s.ctx, key).Result()

	return count > 0, err
}

func (s *Service) AddRevokeAccessToken(token string) error {
	jti, err := s.jwtUtl.ExtractJTI(token)
	if err != nil {
		return err
	} else if jti == nil {
		return fmt.Errorf("JTI not found")
	}

	key := s.cfg.RedisPrefix + ":revoked-access-token:" + *jti

	return s.client.Set(s.ctx, key, "true", revokeAccessTokenValidity).Err()
}

func (s *Service) AddRevokeRefreshToken(token string) error {
	jti, err := s.jwtUtl.ExtractJTI(token)
	if err != nil {
		return err
	} else if jti == nil {
		return fmt.Errorf("JTI not found")
	}

	key := s.cfg.RedisPrefix + ":revoked-refresh-token:" + *jti

	return s.client.Set(s.ctx, key, "true", revokeRefreshTokenValidity).Err()
}

func (s *Service) GetValueRefreshToken(accessToken string) (*string, error) {
	jti, err := s.jwtUtl.ExtractJTI(accessToken)
	if err != nil {
		return nil, err
	} else if jti == nil {
		return nil, fmt.Errorf("JTI not found")
	}

	keys, err := s.client.Keys(s.ctx, s.cfg.RedisPrefix+":access-token:"+*jti+":refresh-token:*").Result()
	if err != nil {
		logger.Error("Redis get value refresh token result", err)

		return nil, err
	} else if len(keys) == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	var value string
	for _, key := range keys {
		value, err = s.client.Get(s.ctx, key).Result()
		if err != nil {
			logger.Error("Redis get value refresh token loop result", err)

			if err == redis.Nil {
				continue
			}

			return nil, err
		}
	}

	return &value, nil
}
