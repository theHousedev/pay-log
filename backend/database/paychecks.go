package database

func (db *Database) CreatePaycheck(paycheck Paycheck) Response { ... }
func (db *Database) GetCurrentPaycheck() (*Paycheck, error) { ... }
func (db *Database) GetPaycheckHours(paycheckID int) (map[string]float64, error) { ... }
func (db *Database) CalculatePaycheckTotal(paycheckID int) (*PaycheckTotal, error) { ... }
