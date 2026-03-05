package marketplaceapi

import (
	"time"
)

type OauthAuthorizeResponse struct {
	Message string                     `json:"message"`
	Data    OauthAuthorizeResponseData `json:"data"`
}

type OauthAuthorizeResponseData struct {
	Code   string `json:"code"`
	ShopID string `json:"shop_id"`
	State  string `json:"state"`
}

type OauthTokenResponse struct {
	Message string                 `json:"message"`
	Data    OauthTokenResponseData `json:"data"`
}

type OauthTokenResponseData struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
}

type GetOrderListResponse struct {
	Message string     `json:"message"`
	Data    []OrderDTO `json:"data"`
}

type GetOrderDetailResponse struct {
	Message string   `json:"message"`
	Data    OrderDTO `json:"data"`
}

type CallAPIConfig struct {
	RequiredBearerToken bool
	BearerToken         string
}

type OrderDTO struct {
	ShopID                string     `json:"shop_id"`
	OrderSN               string     `json:"order_sn"`
	Status                string     `json:"status"`
	ShippingStatus        string     `json:"shipping_status"`
	TrackingNumber        string     `json:"tracking_number"`
	TotalAmount           float64    `json:"total_amount"`
	RawMarketplacePayload string     `json:"raw_marketplace_payload"`
	CreatedAt             *time.Time `json:"created_at,omitempty"`

	Items []OrderItemDTO `json:"items,omitempty"`
}

type OrderItemDTO struct {
	OrderID  uint64  `json:"order_id"`
	SKU      string  `json:"sku"`
	Quantity int     `json:"quantity"`
	Price    float64 `json:"price"`
}

type PostLogisticShipResponse struct {
	Message string                       `json:"message"`
	Data    PostLogisticShipResponseData `json:"data"`
}

type PostLogisticShipResponseData struct {
	OrderSN        string `json:"order_sn"`
	TrackingNo     string `json:"tracking_no"`
	ShippingStatus string `json:"shipping_status"`
}

type GetLogisticChannelsResponse struct {
	Message string               `json:"message"`
	Data    []LogisticChannelDTO `json:"data"`
}

type LogisticChannelDTO struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Code string `json:"code"`
}

type RefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}
