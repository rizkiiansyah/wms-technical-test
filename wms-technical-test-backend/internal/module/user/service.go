package user

import (
	authmiddleware "wms-technical-test-backend/internal/middleware/auth"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo}
}

func (s *Service) FindByEmail(email string) (*User, error) {
	return s.repo.FindByEmail(email)
}

func (s *Service) FindByID(ID uint64) (*User, error) {
	return s.repo.FindByID(ID)
}

func (s *Service) FindAuthByID(ID uint64) (*authmiddleware.User, error) {
	user, err := s.repo.FindByID(ID)
	if err != nil {
		return nil, err
	}

	return &authmiddleware.User{
		ID:        user.ID,
		Email:     user.Email,
		Password:  user.Password,
		RoleID:    user.RoleID,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
		RoleName:  user.RoleName,
	}, nil
}
