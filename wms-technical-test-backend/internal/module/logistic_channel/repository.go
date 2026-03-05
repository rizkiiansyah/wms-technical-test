package logisticchannel

import (
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

func (r *Repository) BulkInsert(logisticChannels []LogisticChannel) error {
	err := r.db.
		Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "id"}},
			DoUpdates: clause.Assignments(map[string]interface{}{
				"name":       gorm.Expr("EXCLUDED.name"),
				"code":       gorm.Expr("EXCLUDED.code"),
				"updated_at": gorm.Expr("NOW()"),
			}),
		}).
		CreateInBatches(&logisticChannels, 50).Error
	if err != nil {
		logger.Error("Logistic channel bulk insert", err)
	}

	return err
}

func (r *Repository) FindAll() ([]LogisticChannel, error) {
	var logisticChannels []LogisticChannel
	if err := r.db.Find(&logisticChannels).Error; err != nil {
		logger.Error("Logistic channel find all", err)

		return nil, err
	}

	return logisticChannels, nil
}
