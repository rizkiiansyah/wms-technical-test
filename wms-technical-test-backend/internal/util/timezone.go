package util

import "time"

func InitTimezone() {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		panic(err)
	}

	time.Local = loc
}
