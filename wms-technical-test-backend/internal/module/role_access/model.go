package roleaccess

import "time"

type RoleAccess struct {
	ID        uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string     `gorm:"size:100;unique" json:"name"`
	Key       string     `gorm:"size:100;unique" json:"key"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}
