package scheduler

import (
	"time"
	"wms-technical-test-backend/internal/logger"
	logisticchannel "wms-technical-test-backend/internal/module/logistic_channel"
	marketplaceapi "wms-technical-test-backend/internal/module/marketplace_api"
	"wms-technical-test-backend/internal/module/order"

	"github.com/go-co-op/gocron"
)

func Run(marketplaceApiSvc *marketplaceapi.Service, orderSvc *order.Service, logisticChannelSvc *logisticchannel.Service) {
	scheduler := gocron.NewScheduler(time.UTC)

	scheduler.Every(1).Minutes().Do(func() {
		SyncOrders(marketplaceApiSvc, orderSvc)
		SyncLogisticChannels(marketplaceApiSvc, logisticChannelSvc)
	})
	scheduler.StartAsync()
}

func SyncOrders(marketplaceApiSvc *marketplaceapi.Service, orderSvc *order.Service) {
	logger.Info("Start sync marketplace api order list")

	result, err := marketplaceApiSvc.GetOrderList()
	if err != nil {
		logger.Error("Error marketplace api get order list: ", err)

		return
	}

	apiOrders := result.Data
	readyToPick := "READY_TO_PICK"

	var orders []order.Order
	var orderItems []order.OrderItem
	for _, apiOrder := range apiOrders {
		for _, apiItem := range apiOrder.Items {
			orderItems = append(orderItems, order.OrderItem{
				OrderSN:  apiOrder.OrderSN,
				SKU:      apiItem.SKU,
				Quantity: apiItem.Quantity,
				Price:    apiItem.Price,
			})
		}

		orders = append(orders, order.Order{
			ShopID:                apiOrder.ShopID,
			OrderSN:               apiOrder.OrderSN,
			WMSStatus:             &readyToPick,
			MarketplaceStatus:     apiOrder.Status,
			ShippingStatus:        apiOrder.ShippingStatus,
			TrackingNumber:        apiOrder.TrackingNumber,
			TotalAmount:           apiOrder.TotalAmount,
			RawMarketplacePayload: apiOrder.RawMarketplacePayload,
			CreatedAt:             apiOrder.CreatedAt,
		})
	}

	err = orderSvc.BulkInsertWithOrderItems(orders, orderItems)
	if err != nil {
		return
	}

	logger.Info("Finish sync marketplace api order list")
}

func SyncLogisticChannels(marketplaceApiSvc *marketplaceapi.Service, logisticChannelSvc *logisticchannel.Service) {
	logger.Info("Start sync marketplace api logistic channels")

	result, err := marketplaceApiSvc.GetLogisticChannels()
	if err != nil {
		logger.Error("Error marketplace api get logistic channels: ", err)

		return
	}

	apiLogisticChannels := result.Data

	var logisticChannels []logisticchannel.LogisticChannel
	for _, logisticChannel := range apiLogisticChannels {
		logisticChannels = append(logisticChannels, logisticchannel.LogisticChannel{
			ID:   logisticChannel.ID,
			Name: logisticChannel.Name,
			Code: logisticChannel.Code,
		})
	}

	err = logisticChannelSvc.BulkInsert(logisticChannels)
	if err != nil {
		logger.Error("Error logistic channel bulk insert: ", err)

		return
	}

	logger.Info("Finish sync marketplace logistic channels")
}
