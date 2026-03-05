package order

import "time"

type Order struct {
	OrderSN               string     `gorm:"size:255;primaryKey" json:"order_sn"`
	ShopID                string     `gorm:"index" json:"shop_id"`
	MarketplaceStatus     string     `gorm:"size:255" json:"marketplace_status"`
	ShippingStatus        string     `gorm:"size:255" json:"shipping_status"`
	WMSStatus             *string    `gorm:"size:255" json:"wms_status"`
	TrackingNumber        string     `gorm:"size:255" json:"tracking_number"`
	TotalAmount           float64    `gorm:"type:decimal(15,2);default:0" json:"total_amount"`
	RawMarketplacePayload string     `gorm:"type:text" json:"raw_marketplace_payload"`
	CreatedAt             *time.Time `json:"created_at,omitempty"`
	UpdatedAt             *time.Time `json:"updated_at,omitempty"`

	Items []OrderItem `gorm:"foreignKey:OrderSN;references:OrderSN" json:"items,omitempty"`
}

type OrderItem struct {
	OrderSN  string  `gorm:"size:255;index" json:"order_sn"`
	SKU      string  `gorm:"size:255" json:"sku"`
	Quantity int     `json:"quantity"`
	Price    float64 `gorm:"type:decimal(15,2);default:0" json:"price"`
}

type OrderMarketplaceStatus string

const (
	MarketplaceStatusPaid       OrderMarketplaceStatus = "paid"
	MarketplaceStatusProcessing OrderMarketplaceStatus = "processing"
	MarketplaceStatusShipping   OrderMarketplaceStatus = "shipping"
	MarketplaceStatusDelivered  OrderMarketplaceStatus = "delivered"
	MarketplaceStatusCancelled  OrderMarketplaceStatus = "cancelled"
)

var validOrderMarketplaceStatuses = map[OrderMarketplaceStatus]struct{}{
	MarketplaceStatusProcessing: {},
	MarketplaceStatusPaid:       {},
	MarketplaceStatusShipping:   {},
	MarketplaceStatusDelivered:  {},
	MarketplaceStatusCancelled:  {},
}

type OrderShippingStatus string

const (
	ShippingStatusLabelCreated   OrderShippingStatus = "label_created"
	ShippingStatusAwaitingPickup OrderShippingStatus = "awaiting_pickup"
	ShippingStatusShippied       OrderShippingStatus = "shipped"
	ShippingStatusDelivered      OrderShippingStatus = "delivered"
	ShippingStatusCancelled      OrderShippingStatus = "cancelled"
)

var validOrderShippingStatuses = map[OrderShippingStatus]struct{}{
	ShippingStatusAwaitingPickup: {},
	ShippingStatusLabelCreated:   {},
	ShippingStatusDelivered:      {},
	ShippingStatusShippied:       {},
	ShippingStatusCancelled:      {},
}

type OrderWMSStatus string

const (
	WMSStatusLabelReadyToPick OrderWMSStatus = "READY_TO_PICK"
	WMSStatusPicking          OrderWMSStatus = "PICKING"
	WMSStatusPacked           OrderWMSStatus = "PACKED"
	WMSStatusShipped          OrderWMSStatus = "SHIPPED"
)

var validOrderWMSStatuses = map[OrderWMSStatus]struct{}{
	WMSStatusLabelReadyToPick: {},
	WMSStatusPicking:          {},
	WMSStatusPacked:           {},
	WMSStatusShipped:          {},
}
