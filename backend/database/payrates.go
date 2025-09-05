package database

func (db *Database) CreatePayRate(rate PayRate) Response {
	return Response{
		Status:  "OK",
		Message: "Pay rate created (TODO)",
	}
}

func (db *Database) GetRates(checkID int) ([]PayRate, error) {
	return nil, nil
}
