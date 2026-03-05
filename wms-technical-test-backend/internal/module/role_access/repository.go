package roleaccess

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

func (r *Repository) FindByRoleIDAndKeys(roleID uint64, keys []string) ([]RoleAccess, error) {
	var accesses []RoleAccess
	err := r.db.Where("role_id = ?", roleID).
		Where("key IN ?", keys).
		Find(&accesses).Error
	if err != nil {
		logger.Error("Role access find by role id and keys", err)

		return nil, err
	}

	return accesses, nil
}

func (r *Repository) FindAllByRoleID(roleID uint64) ([]RoleAccess, error) {
	var accesses []RoleAccess
	err := r.db.Where("role_id = ?", roleID).
		Find(&accesses).Error
	if err != nil {
		logger.Error("Role access find all by role id", err)

		return nil, err
	}

	return accesses, nil
}
