package logisticchannel

import "time"

type LogisticChannel struct {
	ID        string     `gorm:"primaryKey" json:"id"`
	Name      string     `gorm:"size:100" json:"name"`
	Code      string     `gorm:"size:" json:"code"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}
