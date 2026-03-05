package logisticchannel

import (
	"wms-technical-test-backend/internal/errs"

	"github.com/gofiber/fiber/v2"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo}
}

func (s *Service) BulkInsert(logisticChannels []LogisticChannel) error {
	err := s.repo.BulkInsert(logisticChannels)

	return err
}

func (s *Service) Dropdown() ([]LogisticChannel, error) {
	logisticChannels, err := s.repo.FindAll()
	if err != nil {
		return nil, errs.NewWithMessage(fiber.ErrInternalServerError.Code, "Error get logistic channel list")
	}

	return logisticChannels, nil
}
