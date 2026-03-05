package validator

import (
	"net/mail"
	"regexp"
	"unicode"

	"github.com/go-playground/validator/v10"
)

var Validate = validator.New()

func init() {
	Validate.RegisterValidation("password", validatePassword)
	Validate.RegisterValidation("hasuppercase", hasUppercase)
	Validate.RegisterValidation("haslowercase", hasLowercase)
	Validate.RegisterValidation("hasnumber", hasNumber)
	Validate.RegisterValidation("hasspecial", hasSpecial)
	Validate.RegisterValidation("email", email)
}

func validatePassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	regex := `^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).+$`
	match, _ := regexp.MatchString(regex, password)

	return match
}

func hasUppercase(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	for _, c := range password {
		if unicode.IsUpper(c) {
			return true
		}
	}
	return false
}

func hasLowercase(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	for _, c := range password {
		if unicode.IsLower(c) {
			return true
		}
	}
	return false
}

func hasNumber(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	for _, c := range password {
		if unicode.IsDigit(c) {
			return true
		}
	}
	return false
}

func hasSpecial(fl validator.FieldLevel) bool {
	password := fl.Field().String()
	for _, c := range password {
		if unicode.IsPunct(c) || unicode.IsSymbol(c) {
			return true
		}
	}
	return false
}

func email(fl validator.FieldLevel) bool {
	email := fl.Field().String()

	_, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}

	return true
}
