package webhook

type UpdateOrderStatusRequest struct {
	OrderSN string `json:"order_sn"`
	Status  string `json:"status"`
}

type UpdateShippingStatusRequest struct {
	OrderSN string `json:"order_sn"`
	Status  string `json:"status"`
}
