package marketplaceapi

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func GenerateSignAuthorize(apiPath, partnerID, shopID, partnerKey string, ts int64) string {
	base := partnerID + apiPath + fmt.Sprintf("%d", ts) + shopID
	h := hmac.New(sha256.New, []byte(partnerKey))
	h.Write([]byte(base))

	return hex.EncodeToString(h.Sum(nil))
}

func GenerateSignToken(apiPath, partnerID, code, partnerKey string, ts int64) string {
	base := partnerID + apiPath + fmt.Sprintf("%d", ts) + code
	h := hmac.New(sha256.New, []byte(partnerKey))
	h.Write([]byte(base))

	return hex.EncodeToString(h.Sum(nil))
}

func CallAPI[T any](fullURL, method string, body map[string]interface{}, config *CallAPIConfig) (T, error, *string) {
	var req *http.Request
	var err error
	var zero T

	if method == "POST" {
		jsonData, _ := json.Marshal(body)
		req, err = http.NewRequest("POST", fullURL, bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest(method, fullURL, nil)
	}

	if config != nil && config.RequiredBearerToken && config.BearerToken != "" {
		req.Header.Set("Authorization", "Bearer "+config.BearerToken)
	}

	if err != nil {
		return zero, err, nil
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return zero, err, nil
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	contentType := resp.Header.Get("Content-Type")

	switch resp.StatusCode {
	case 200, 201:
		var result T

		if strings.Contains(contentType, "application/json") {
			if err := json.Unmarshal(respBody, &result); err != nil {
				return zero, err, nil
			}

			return result, nil, nil
		}

		return zero, nil, nil
	case 401:
		var errResp ErrorResponse
		var respMessage *string
		if err := json.Unmarshal(respBody, &errResp); err == nil {
			respMessage = &errResp.Message
		}

		return zero, fiber.ErrUnauthorized, respMessage
	case 429:
		return zero, fiber.ErrTooManyRequests, nil
	case 500:
		return zero, fiber.ErrInternalServerError, nil
	default:
		return zero, fmt.Errorf("Unexpected status %d: %s", resp.StatusCode, string(respBody)), nil
	}
}
