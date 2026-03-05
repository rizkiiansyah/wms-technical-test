package helper

import (
	"regexp"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

func ToTitleCase(s string) string {
	s = strings.ReplaceAll(s, "_", " ")
	caser := cases.Title(language.English)

	return caser.String(strings.ToLower(s))
}

func ToSentenceCase(s string) string {
	s = strings.ReplaceAll(s, "_", " ")
	s = strings.ToLower(s)
	caser := cases.Title(language.English)

	return caser.String(s[:1]) + s[1:]
}

func ToHumanReadable(input string) string {
	re := regexp.MustCompile(`([a-z0-9])([A-Z])`)
	snake := re.ReplaceAllString(input, "${1} ${2}")

	return strings.ToLower(snake)
}
