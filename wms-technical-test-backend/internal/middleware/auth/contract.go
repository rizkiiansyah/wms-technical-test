package auth

import "time"

type UserProvider interface {
	FindAuthByID(ID uint64) (*User, error)
}

type User struct {
	ID        uint64     `gorm:"primaryKey;autoIncrement" json:"id"`
	Email     string     `gorm:"size:255;index;unique;" json:"email"`
	Password  string     `gorm:"size:255;" json:"-"`
	RoleID    uint64     `gorm:"index;unique" json:"role_id"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`

	RoleName string `json:"role_name"`
}
