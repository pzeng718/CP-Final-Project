import React from 'react';
import moment from 'moment';

const DateSelector = ({ selectedDate, setSelectedDate }) => {
    const generateDateRange = (startDate, endDate) => {
        const start = moment(startDate);
        const end = moment(endDate);
        const dates = [];

        while (start <= end) {
            dates.push(start.format('MM-DD'));
            start.add(1, 'days');
        }

        return dates;
    };

    const dateRange = generateDateRange(moment().subtract(5, 'days'), moment().add(5, 'days'));

    return (
        <div className='date-picker'>
            {dateRange.map(date => (
                <div 
                    key={date} 
                    onClick={() => setSelectedDate(date)}
                    style={{
                        padding: '10px', 
                        cursor: 'pointer',
                        backgroundColor: selectedDate === date ? 'lightblue' : 'transparent'
                    }}
                >
                    {date}
                </div>
            ))}
        </div>
    );
};

export default DateSelector;
