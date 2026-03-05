package order

type ListFilter struct {
	Page      int    `json:"page"`
	PerPage   int    `json:"per_page"`
	WMSStatus string `json:"wms_status"`
}

type OrderList struct {
	OrderSN           string `json:"order_sn"`
	MarketplaceStatus string `json:"marketplace_status"`
	ShippingStatus    string `json:"shipping_status"`
	WMSStatus         string `json:"wms_status"`
	TrackingNumber    string `json:"tracking_number"`
	UpdatedAt         string `json:"updated_at"`
}

type OrderShipRequest struct {
	ChannelID string `json:"channel_id" validate:"required"`
}
