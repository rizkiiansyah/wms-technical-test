package logger

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

func Info(message string) {
	log.Printf("[INFO] %s", message)
}

func Error(message string, err error) {
	if err != nil {
		log.Printf("[ERROR] %s, %v", message, err)

		return
	}

	log.Printf("[ERROR] %s", message)
}

func InfoWithUserEmail(message string, c *fiber.Ctx) {
	var userEmail *string
	if c != nil {
		data, ok := c.Locals("data").(map[string]interface{})

		if ok && data != nil {
			email, ok := data["user_email"].(string)
			if ok {
				userEmail = &email
			}
		}
	}

	if userEmail != nil {
		log.Printf("[%s] %s", *userEmail, message)
	} else {
		log.Printf("[INFO] %s", message)
	}
}

func ErrorWithUserEmail(message string, err error, c *fiber.Ctx) {
	var userEmail *string
	if c != nil {
		data, ok := c.Locals("data").(map[string]interface{})

		if ok && data != nil {
			email, ok := data["user_email"].(string)
			if ok {
				userEmail = &email
			}
		}
	}

	if err != nil {
		if userEmail != nil {
			log.Printf("[ERROR][%s] %s, %v", *userEmail, message, err)
		} else {
			log.Printf("[ERROR] %s, %v", message, err)
		}

		return
	}

	if userEmail != nil {
		log.Printf("[%s] %s", *userEmail, message)
	} else {
		log.Printf("[ERROR] %s", message)
	}
}
