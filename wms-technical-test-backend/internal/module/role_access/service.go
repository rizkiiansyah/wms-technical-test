package roleaccess

import "wms-technical-test-backend/internal/config"

type Service struct {
	repo *Repository
	cfg  *config.Config
}

func NewService(repo *Repository, cfg *config.Config) *Service {
	return &Service{repo, cfg}
}

func (s *Service) FindByRoleIDAndKeys(roleID uint64, keys []string) ([]RoleAccess, error) {
	return s.repo.FindByRoleIDAndKeys(roleID, keys)
}

func (s *Service) FindAllByRoleID(roleID uint64) ([]RoleAccess, error) {
	return s.repo.FindAllByRoleID(roleID)
}
