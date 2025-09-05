package database

func (database *Database) CreatePayRate(rate PayRate) Response {
	return Response{
		Status:  "OK",
		Message: "Pay rate created (TODO)",
	}
}

func (database *Database) GetRates(checkID int) ([]PayRate, error) {
	return nil, nil
}
