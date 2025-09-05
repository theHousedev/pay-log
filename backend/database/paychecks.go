package database

func (database *Database) CreatePaycheck(paycheck Paycheck) Response {
	return Response{
		Status:  "OK",
		Message: "Paycheck created (TODO)",
	}
}

func (database *Database) GetCurrentPaycheck() (*Paycheck, error) {
	return nil, nil
}

func (database *Database) GetPaycheckHours(paycheckID int) (map[string]float64, error) {
	return nil, nil
}
