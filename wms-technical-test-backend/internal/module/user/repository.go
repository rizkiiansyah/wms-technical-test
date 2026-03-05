package user

import (
	"wms-technical-test-backend/internal/database"
	"wms-technical-test-backend/internal/logger"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository() *Repository {
	return &Repository{db: database.DB}
}

func (r *Repository) FindByEmail(email string) (*User, error) {
	var user User
	err := r.db.
		Select("users.*, roles.name as role_name").
		Joins("JOIN roles ON roles.id = users.role_id").
		Where("email = ?", email).
		First(&user).Error
	if err != nil {
		logger.Error("User find by email", err)

		return nil, err
	}

	return &user, err
}

func (r *Repository) FindByID(ID uint64) (*User, error) {
	var user User
	err := r.db.
		Select("users.*, roles.name as role_name").
		Joins("JOIN roles ON roles.id = users.role_id").
		Where("users.id = ?", ID).
		First(&user, ID).Error
	if err != nil {
		logger.Error("User find by id", err)

		return nil, err
	}

	return &user, err
}
