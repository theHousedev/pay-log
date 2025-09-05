package database

import "strings"

func nilCheck[T any](ptr *T) any {
	if ptr != nil {
		return *ptr
	}
	return nil
}

func getTableName(errorMsg string) string {
	if strings.Contains(errorMsg, "table") && strings.Contains(errorMsg, "already exists") {
		parts := strings.Fields(errorMsg)
		for i, part := range parts {
			if part == "table" && i+1 < len(parts) {
				return parts[i+1]
			}
		}
	}
	return "[can't retrieve table name]"
}
