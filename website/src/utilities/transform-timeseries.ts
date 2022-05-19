import { max, omit } from 'lodash';

const _mergeTimeColumns = (rawData: { [key: string]: any }[]) => {
    const maxDate = max(rawData.map((d) => d['date']));
    const newData = rawData.map((d) => ({
        ...omit(d, ['ID', 'date', 'hour']),
        hour: d['date'] === maxDate ? d['hour'] : d['hour'] - 24,
    }));
    if (newData.length === 0) {
        return { newMaxTime: undefined, newData: [] };
    } else {
        const maxHour = max(newData.map((d) => d['hour']));
        return { newMaxTime: { date: maxDate, hour: maxHour }, newData };
    }
};

const _renderTimeLabel = (hour: number) => {
    if (hour < 0) {
        hour += 24;
    }
    const _hours = Math.floor(hour);
    const _minutes = Math.floor((hour - _hours) * 60);
    const _seconds = Math.floor(((hour - _hours) * 60 - _minutes) * 60);
    return (
        `${_hours.toString().padStart(2, '0')}:` +
        `${_minutes.toString().padStart(2, '0')}:` +
        `${_seconds.toString().padStart(2, '0')}`
    );
};

const transformTimeseries = {
    mergeTimeColumns: _mergeTimeColumns,
    renderTimeLabel: _renderTimeLabel,
};

export default transformTimeseries;
