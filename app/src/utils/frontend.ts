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
            // target: XX - XXFEB2025
            return fmtDate('dd', start) + ' - ' +
                fmtDate('ddmmm', end) + startYear;
        }
        // target: XXFEB - XXMAR2025
        return fmtDate('ddmmm', start) + ' - ' +
            fmtDate('ddmmm', end) + endYear;
    }
    // target: XXDEC2025 - XXJAN2026
    return fmtDate('ddmmm', start) + startYear +
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