package order

import (
	"encoding/json"
	"errors"
	"math"
	"wms-technical-test-backend/internal/errs"
	"wms-technical-test-backend/internal/logger"
	marketplaceapi "wms-technical-test-backend/internal/module/marketplace_api"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Service struct {
	repo              *Repository
	marketplaceApiSvc *marketplaceapi.Service
}

func NewService(repo *Repository, marketplaceApiSvc *marketplaceapi.Service) *Service {
	return &Service{repo, marketplaceApiSvc}
}

func (s *Service) List(filter ListFilter) ([]OrderList, int64, int, error) {
	if filter.WMSStatus != "" {
		wmsStatus := OrderWMSStatus(filter.WMSStatus)
		if !IsValidOrderWMSStatus(wmsStatus) {
			return nil, 0, 0, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Invalid wms status")
		}
	}

	orders, total, err := s.repo.List(filter)
	if err != nil {
		return nil, 0, 0, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order list")
	}

	totalPages := int(math.Ceil(float64(total) / float64(filter.PerPage)))

	return orders, total, totalPages, nil
}

func (s *Service) Detail(orderSN string) (*Order, error) {
	order, err := s.repo.FindByOrderSN(orderSN)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order detail")
	}

	orderItems, err := s.repo.FindOrderItemsByOrderSN(orderSN)
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order item list")
	}

	order.Items = orderItems

	return order, nil
}

func (s *Service) Pick(orderSN string) (*Order, error) {
	order, err := s.repo.FindByOrderSN(orderSN)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order detail")
	}

	if order.WMSStatus == nil || *order.WMSStatus != "READY_TO_PICK" {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order wms status is not ready to pick")
	}

	order, err = s.repo.UpdateWMSStatusByOrderSN(order.OrderSN, "PICKING")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error update order")
	}

	return order, nil
}

func (s *Service) Pack(orderSN string) (*Order, error) {
	order, err := s.repo.FindByOrderSN(orderSN)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order detail")
	}

	if order.WMSStatus == nil || *order.WMSStatus != "PICKING" {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order wms status is not picking")
	}

	order, err = s.repo.UpdateWMSStatusByOrderSN(order.OrderSN, "PACKED")
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error update order")
	}

	return order, nil
}

func (s *Service) Ship(orderSN string, req OrderShipRequest) (*Order, error) {
	order, err := s.repo.FindByOrderSN(orderSN)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	}
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order detail")
	}

	if order.WMSStatus == nil || *order.WMSStatus != "PACKED" {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order wms status is not packed")
	}

	result, err := s.marketplaceApiSvc.PostLogisticShip(order.OrderSN, req.ChannelID)
	if err != nil {
		logger.Error("Error post logistic ship: ", err)

		return nil, err
	}

	resultData := result.Data
	var dataString string
	jsonBytes, err := json.Marshal(resultData)
	if err != nil {
		dataString = ""
	} else {
		dataString = string(jsonBytes)
	}

	order, err = s.repo.UpdateShippingInfoByOrderSN(order.OrderSN, "SHIPPED", resultData.TrackingNo, resultData.ShippingStatus, dataString)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error update order")
	}

	return order, nil
}

func (s *Service) BulkInsertWithOrderItems(orders []Order, orderItems []OrderItem) error {
	err := s.repo.BulkInsertWithOrderItems(orders, orderItems)

	return err
}

func (s *Service) UpdateMarketplaceStatus(orderSN, status string) (*Order, error) {
	marketplaceStatus := OrderMarketplaceStatus(status)
	if !IsValidOrderMarketplaceStatus(marketplaceStatus) {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Invalid marketplace status")
	}

	order, err := s.repo.FindByOrderSN(orderSN)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order detail")
	}

	order, err = s.repo.UpdateMarketplaceStatusByOrderSN(orderSN, status)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error update order")
	}

	return order, nil
}

func (s *Service) UpdateShippingStatus(orderSN, status string) (*Order, error) {
	shippingStatus := OrderShippingStatus(status)
	if !IsValidOrderShippingStatus(shippingStatus) {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Invalid shipping status")
	}

	order, err := s.repo.FindByOrderSN(orderSN)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get order detail")
	}

	order, err = s.repo.UpdateShippingStatusByOrderSN(orderSN, status)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, errs.NewWithMessage(fiber.ErrNotFound.Code, "Order not found")
	} else if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error update order")
	}

	return order, nil
}

func IsValidOrderMarketplaceStatus(status OrderMarketplaceStatus) bool {
	_, ok := validOrderMarketplaceStatuses[status]

	return ok
}

func IsValidOrderShippingStatus(status OrderShippingStatus) bool {
	_, ok := validOrderShippingStatuses[status]

	return ok
}

func IsValidOrderWMSStatus(status OrderWMSStatus) bool {
	_, ok := validOrderWMSStatuses[status]

	return ok
}
