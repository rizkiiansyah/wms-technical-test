package errs

type AppError struct {
	Code    int         `json:"code,omitempty"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

func (e *AppError) Error() string {
	return e.Message
}

func New(code int, message string, data interface{}) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Data:    data,
	}
}

func NewWithMessage(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

func NewWithData(code int, data interface{}) *AppError {
	return &AppError{
		Code: code,
		Data: data,
	}
}
