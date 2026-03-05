package validator

import (
	"reflect"
	"wms-technical-test-backend/internal/helper"

	"github.com/go-playground/validator/v10"
)

func FormatValidationError(err error, s interface{}) map[string]string {
	errorsMap := make(map[string]string)
	validationErrors := err.(validator.ValidationErrors)
	structType := reflect.TypeOf(s)

	for _, fieldErr := range validationErrors {
		fieldName := fieldErr.Field()
		field, _ := structType.FieldByName(fieldName)
		jsonTag := field.Tag.Get("json")
		humanField := helper.ToSentenceCase(jsonTag)

		switch fieldErr.Tag() {
		case "required":
			errorsMap[jsonTag] = humanField + " is required"
		case "email":
			errorsMap[jsonTag] = humanField + " should email format"
		}
	}

	return errorsMap
}
