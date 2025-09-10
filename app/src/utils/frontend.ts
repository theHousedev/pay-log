export const formatDateRange = (startDate: string, endDate: string) => {
    const parseDate = (dateStr: string) => {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const start = parseDate(startDate);
    const startYear = start.getFullYear();
    const end = parseDate(endDate);
    const endYear = end.getFullYear();

    if (startYear === endYear) {
        return fmtDate('s', start) + ' -\n\n' + fmtDate('s', end) + startYear;
    }
    return fmtDate('s', start) + startYear + ' -\n\n' + fmtDate('s', end) + endYear;
};

export const fmtDate = (format: string, date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    switch (format) {
        case 's':
            return `${day}${date.toLocaleDateString(
                'en-US', { month: 'short' }).toUpperCase()}`;
        default:
            return `${day}${date.toLocaleDateString(
                'en-US', { month: 'short' }).toUpperCase()}${date.getFullYear()}`;
    }


};