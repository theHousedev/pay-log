export const formatDateRange = (startDate: string, endDate: string) => {
    const parseDate = (dateStr: string) => {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const start = parseDate(startDate);
    const startMonth = start.getMonth();
    const startYear = start.getFullYear();
    const end = parseDate(endDate);
    const endMonth = end.getMonth();
    const endYear = end.getFullYear();

    if (startYear === endYear) {
        if (startMonth === endMonth) {
            return fmtDate('dd', start) + ' - ' +
                fmtDate('ddmmm', end) + startYear;
        }
        return fmtDate('dd', start) + startMonth + ' - ' +
            fmtDate('ddmmm', end) + endYear;
    }
    return fmtDate('dd', start) + startMonth + startYear +
        ' - ' + fmtDate('ddmmm', end) + endYear;
};

export const fmtDate = (format: string, date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    switch (format) {
        case 'dd':
            return `${day}`;
        case 'ddmmm':
            return `${day}${date.toLocaleDateString(
                'en-US', { month: 'short' }).toUpperCase()}`;
        default:
            return `${day}${date.toLocaleDateString(
                'en-US', { month: 'short' }).toUpperCase()}${date.getFullYear()}`;
    }


};