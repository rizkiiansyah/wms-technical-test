package webhook

import (
	"wms-technical-test-backend/internal/module/order"
)

type Service struct {
	orderSvc *order.Service
}

func NewService(orderSvc *order.Service) *Service {
	return &Service{orderSvc}
}

func (s *Service) UpdateOrderStatus(req UpdateOrderStatusRequest) (*order.Order, error) {
	order, err := s.orderSvc.UpdateMarketplaceStatus(req.OrderSN, req.Status)
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *Service) UpdateShippingStatus(req UpdateShippingStatusRequest) (*order.Order, error) {
	order, err := s.orderSvc.UpdateShippingStatus(req.OrderSN, req.Status)
	if err != nil {
		return nil, err
	}

	return order, nil
}
