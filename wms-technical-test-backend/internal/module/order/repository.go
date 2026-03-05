package order

import (
	"time"
	"wms-technical-test-backend/internal/database"
	"wms-technical-test-backend/internal/logger"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository() *Repository {
	return &Repository{db: database.DB}
}

func (r *Repository) List(filter ListFilter) ([]OrderList, int64, error) {
	var orders []OrderList
	var total int64

	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.PerPage <= 0 {
		filter.PerPage = 10
	}

	offset := (filter.Page - 1) * filter.PerPage
	q := r.db.Model(&Order{})

	if filter.WMSStatus != "" {
		q = q.Where("wms_status = ?", filter.WMSStatus)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := q.
		Select("order_sn, marketplace_status, shipping_status, wms_status, tracking_number, updated_at").
		Order("updated_at desc").
		Limit(filter.PerPage).
		Offset(offset).
		Find(&orders).Error; err != nil {
		logger.Error("Order list", err)

		return nil, 0, err
	}

	return orders, total, nil
}

func (r *Repository) FindByOrderSN(orderSN string) (*Order, error) {
	var order Order
	err := r.db.Where("order_sn = ?", orderSN).
		First(&order).Error
	if err != nil {
		logger.Error("Order find by order sn", err)

		return nil, err
	}

	return &order, err
}

func (r *Repository) FindOrderItemsByOrderSN(orderSN string) ([]OrderItem, error) {
	var orderItems []OrderItem
	err := r.db.Where("order_sn = ?", orderSN).
		Find(&orderItems).Error
	if err != nil {
		logger.Error("Order find order items by order sn", err)

		return nil, err
	}

	return orderItems, err
}

func (r *Repository) UpdateWMSStatusByOrderSN(orderSN, value string) (*Order, error) {
	result := r.db.Model(&Order{}).Where("order_sn = ?", orderSN).
		Updates(map[string]interface{}{
			"wms_status": value,
			"updated_at": time.Now(),
		})
	if result.Error != nil {
		logger.Error("Order update wms status by order sn", result.Error)

		return nil, result.Error
	} else if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	updatedOrder, err := r.FindByOrderSN(orderSN)
	if err != nil {
		return nil, err
	}

	return updatedOrder, nil
}

func (r *Repository) BulkInsertWithOrderItems(orders []Order, orderItems []OrderItem) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		err := tx.
			Clauses(clause.OnConflict{
				Columns: []clause.Column{{Name: "order_sn"}},
				DoUpdates: clause.Assignments(map[string]interface{}{
					"shop_id":            gorm.Expr("EXCLUDED.shop_id"),
					"marketplace_status": gorm.Expr("EXCLUDED.marketplace_status"),
					"shipping_status":    gorm.Expr("EXCLUDED.shipping_status"),
					"tracking_number":    gorm.Expr("EXCLUDED.tracking_number"),
					"total_amount":       gorm.Expr("EXCLUDED.total_amount"),
					"created_at":         gorm.Expr("EXCLUDED.created_at"),
				}),
			}).
			CreateInBatches(&orders, 50).Error
		if err != nil {
			logger.Error("Order bulk insert with order items order", err)

			return err
		}

		err = tx.
			Clauses(clause.OnConflict{
				Columns: []clause.Column{
					{Name: "order_sn"},
					{Name: "sku"},
				},
				DoUpdates: clause.Assignments(map[string]interface{}{
					"quantity": gorm.Expr("EXCLUDED.quantity"),
					"price":    gorm.Expr("EXCLUDED.price"),
				}),
			}).
			CreateInBatches(&orderItems, 50).Error
		if err != nil {
			logger.Error("Order bulk insert with order items order items", err)

			return err
		}

		return err
	})
}

func (r *Repository) UpdateMarketplaceStatusByOrderSN(orderSN, value string) (*Order, error) {
	result := r.db.Model(&Order{}).Where("order_sn = ?", orderSN).
		Updates(map[string]interface{}{
			"marketplace_status": value,
			"updated_at":         time.Now(),
		})
	if result.Error != nil {
		logger.Error("Order update marketplace status by order sn", result.Error)

		return nil, result.Error
	} else if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	updatedOrder, err := r.FindByOrderSN(orderSN)
	if err != nil {
		return nil, err
	}

	return updatedOrder, nil
}

func (r *Repository) UpdateShippingStatusByOrderSN(orderSN, value string) (*Order, error) {
	result := r.db.Model(&Order{}).Where("order_sn = ?", orderSN).
		Updates(map[string]interface{}{
			"shipping_status": value,
			"updated_at":      time.Now(),
		})
	if result.Error != nil {
		logger.Error("Order update shipping status by order sn", result.Error)

		return nil, result.Error
	} else if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	updatedOrder, err := r.FindByOrderSN(orderSN)
	if err != nil {
		return nil, err
	}

	return updatedOrder, nil
}

func (r *Repository) UpdateShippingInfoByOrderSN(orderSN, wmsStatus, trackingNo, shippingStatus, rawMarketplacePayload string) (*Order, error) {
	result := r.db.Model(&Order{}).Where("order_sn = ?", orderSN).
		Updates(map[string]interface{}{
			"wms_status":              wmsStatus,
			"tracking_number":         trackingNo,
			"shipping_status":         shippingStatus,
			"raw_marketplace_payload": rawMarketplacePayload,
			"updated_at":              time.Now(),
		})
	if result.Error != nil {
		logger.Error("Order update shipping info by order sn", result.Error)

		return nil, result.Error
	} else if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	updatedOrder, err := r.FindByOrderSN(orderSN)
	if err != nil {
		return nil, err
	}

	return updatedOrder, nil
}
