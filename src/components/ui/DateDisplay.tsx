import { fmtDateTime } from '@lib/utils';

type DateFormat = 'full' | 'short' | 'date' | 'time';

interface DateDisplayProps {
    date: Date | string;
    format?: DateFormat;
    className?: string;
}

export default function DateDisplay({ date, format = 'full', className = '' }: DateDisplayProps) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    let displayText: string;

    switch (format) {
        case 'full':
            displayText = fmtDateTime(dateObj);
            break;
        case 'short':
            displayText = dateObj.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            break;
        case 'date':
            displayText = dateObj.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            break;
        case 'time':
            displayText = dateObj.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            });
            break;
        default:
            displayText = fmtDateTime(dateObj);
    }

    return <span className={className}>{displayText}</span>;
}
