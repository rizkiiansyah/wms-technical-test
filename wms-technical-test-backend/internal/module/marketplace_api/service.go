package marketplaceapi

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
	"wms-technical-test-backend/internal/config"
	"wms-technical-test-backend/internal/logger"
	"wms-technical-test-backend/internal/module/redis"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/sync/singleflight"
)

type Service struct {
	redisSvc *redis.Service
	cfg      *config.Config

	mu           sync.RWMutex
	sf           singleflight.Group
	isRefreshing bool
}

func NewService(redisSvc *redis.Service, cfg *config.Config) *Service {
	return &Service{
		redisSvc: redisSvc,
		cfg:      cfg,
	}
}

func (s *Service) CallOauthAuthorize() (*OauthAuthorizeResponse, error) {
	partnerID := s.cfg.MarketplacePartnerID
	partnerKey := s.cfg.MarketplacePartnerKey
	shopID := s.cfg.MarketplaceShopID
	apiPath := "/oauth/authorize"
	ts := time.Now().Unix()
	url := s.cfg.MarketplaceApiUrl + apiPath
	url += "?shop_id=" + shopID
	url += "&state=pm"
	url += "&partner_id=" + partnerID
	url += "&timestamp=" + fmt.Sprintf("%d", ts)
	url += "&sign=" + GenerateSignAuthorize(apiPath, partnerID, shopID, partnerKey, ts)
	url += "&redirect=https://example.com/callback"
	body, err, _ := CallAPI[OauthAuthorizeResponse](url, "GET", nil, &CallAPIConfig{
		RequiredBearerToken: false,
		BearerToken:         "",
	})
	if err != nil {
		logger.Error("Marketplace API get /oauth/authorize", err)

		return nil, GetError(err)
	}

	return &body, nil
}

func (s *Service) CallOauthToken(grantType, key, value string) (*OauthTokenResponse, error) {
	partnerID := s.cfg.MarketplacePartnerID
	partnerKey := s.cfg.MarketplacePartnerKey
	apiPath := "/oauth/token"
	ts := time.Now().Unix()
	url := s.cfg.MarketplaceApiUrl + apiPath
	url += "?partner_id=" + partnerID
	url += "&timestamp=" + fmt.Sprintf("%d", ts)
	url += "&sign=" + GenerateSignToken(apiPath, partnerID, value, partnerKey, ts)
	jsonBody := map[string]interface{}{
		"grant_type": grantType,
		key:          value,
	}
	body, err, _ := CallAPI[OauthTokenResponse](url, "POST", jsonBody, &CallAPIConfig{
		RequiredBearerToken: false,
		BearerToken:         "",
	})
	if err != nil {
		logger.Error("Marketplace API post /oauth/token", err)

		return nil, GetError(err)
	}

	return &body, nil
}

func (s *Service) GetOrderList() (*GetOrderListResponse, error) {
	url := s.cfg.MarketplaceApiUrl + "/order/list"
	call := func(accessToken string) (*GetOrderListResponse, error, *string) {
		body, err, errMessage := CallAPI[GetOrderListResponse](url, "GET", nil, &CallAPIConfig{
			RequiredBearerToken: true,
			BearerToken:         accessToken,
		})
		if err != nil {
			logger.Error("Marketplace API get /order/list", err)

			return nil, GetError(err), errMessage
		}

		return &body, nil, nil
	}

	accessToken, err := s.getAndSetAccessToken()
	if err != nil {
		return nil, err
	}

	result, err, errMessage := call(accessToken)
	resultTry, errTry := s.RetryIfUnauthorized(result, err, errMessage, func(token string) (interface{}, error, *string) {
		return call(token)
	})
	if errTry != nil {
		return nil, errTry
	}

	return resultTry.(*GetOrderListResponse), errTry
}

func (s *Service) PostLogisticShip(orderSN, channelID string) (*PostLogisticShipResponse, error) {
	url := s.cfg.MarketplaceApiUrl + "/logistic/ship"
	call := func(accessToken string) (*PostLogisticShipResponse, error, *string) {
		jsonBody := map[string]interface{}{
			"order_sn":   orderSN,
			"channel_id": channelID,
		}
		body, err, errMessage := CallAPI[PostLogisticShipResponse](url, "POST", jsonBody, &CallAPIConfig{
			RequiredBearerToken: true,
			BearerToken:         accessToken,
		})
		if err != nil {
			logger.Error("Marketplace API post /logistic/ship", err)

			return nil, GetError(err), errMessage
		}

		return &body, err, nil
	}

	accessToken, err := s.getAndSetAccessToken()
	if err != nil {
		return nil, err
	}

	result, err, errMessage := call(accessToken)
	resultTry, errTry := s.RetryIfUnauthorized(result, err, errMessage, func(token string) (interface{}, error, *string) {
		return call(token)
	})
	if errTry != nil {
		return nil, errTry
	}

	return resultTry.(*PostLogisticShipResponse), nil
}

func (s *Service) GetLogisticChannels() (*GetLogisticChannelsResponse, error) {
	url := s.cfg.MarketplaceApiUrl + "/logistic/channels"
	call := func(accessToken string) (*GetLogisticChannelsResponse, error, *string) {
		body, err, errMessage := CallAPI[GetLogisticChannelsResponse](url, "GET", nil, &CallAPIConfig{
			RequiredBearerToken: true,
			BearerToken:         accessToken,
		})
		if err != nil {
			logger.Error("Marketplace API get /logistic/channels", err)

			return nil, GetError(err), errMessage
		}

		return &body, err, nil
	}

	accessToken, err := s.getAndSetAccessToken()
	if err != nil {
		return nil, err
	}

	result, err, errMessage := call(accessToken)
	resultTry, errTry := s.RetryIfUnauthorized(result, err, errMessage, func(token string) (interface{}, error, *string) {
		return call(token)
	})
	if errTry != nil {
		return nil, errTry
	}

	return resultTry.(*GetLogisticChannelsResponse), errTry
}

func (s *Service) getAndSetAccessToken() (string, error) {
	v, err, _ := s.sf.Do("access_token", func() (interface{}, error) {
		accessToken := s.redisSvc.GetMarketplaceApiAccessToken()
		if accessToken == nil {
			authorizeResult, err := s.CallOauthAuthorize()
			if err != nil {
				return "", err
			}

			authCode := authorizeResult.Data.Code

			tokenResult, err := s.CallOauthToken("authorization_code", "code", authorizeResult.Data.Code)
			if err != nil {
				return "", err
			}

			accessToken = &tokenResult.Data.AccessToken
			refreshToken := tokenResult.Data.RefreshToken

			s.redisSvc.SetMarketplaceApiAuthCode(authCode)
			s.redisSvc.SetMarketplaceApiAccessToken(*accessToken)
			s.redisSvc.SetMarketplaceApiRefreshToken(refreshToken)
		}

		return *accessToken, nil
	})
	if err != nil {
		return "", err
	}

	return v.(string), nil
}

func (s *Service) refreshToken() (*RefreshTokenResponse, error) {
	v, err, _ := s.sf.Do("refresh_token", func() (interface{}, error) {
		refreshToken := s.redisSvc.GetMarketplaceApiRefreshToken()
		if refreshToken == nil {
			return nil, fmt.Errorf("Refresh token not found")
		}

		tokenResult, err := s.CallOauthToken("refresh_token", "refresh_token", *refreshToken)
		if err != nil {
			return nil, err
		}

		newAccessToken := tokenResult.Data.AccessToken
		newRefreshToken := tokenResult.Data.RefreshToken

		return &RefreshTokenResponse{
			AccessToken:  newAccessToken,
			RefreshToken: newRefreshToken,
		}, nil
	})

	if err != nil {
		return nil, err
	}

	return v.(*RefreshTokenResponse), nil
}

func (s *Service) RetryIfUnauthorized(result interface{}, err error, errMessage *string, retryFunc func(accessToken string) (interface{}, error, *string)) (interface{}, error) {
	if errors.Is(err, fiber.ErrUnauthorized) && errMessage != nil && strings.Contains(err.Error(), *errMessage) {
		refreshed, refreshErr := s.refreshToken()
		if refreshErr != nil {
			return nil, refreshErr
		}

		s.redisSvc.SetMarketplaceApiAccessToken(refreshed.AccessToken)
		s.redisSvc.SetMarketplaceApiRefreshToken(refreshed.RefreshToken)

		result, err, _ := retryFunc(refreshed.AccessToken)

		return result, err
	} else if err != nil {
		return nil, err
	}

	return result, nil
}
