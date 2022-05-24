import { range, reduce } from 'lodash';

function _sectionize(from: number, to: number, steps: number) {
    return range(from, to + 1, (to - from) / steps);
}

const _mergeTimeColumns = (rawData: any[], columns: string[]) => {
    if (rawData.length === 0) {
        return { newMaxTime: undefined, newData: [] };
    }
    const maxDate = rawData[0][1];
    const maxHour = rawData[0][2];
    const newData: { [key: string]: number | string }[] = rawData.map((d) =>
        reduce(columns, (prev, curr, index) => ({ ...prev, [curr]: d[4 + index] }), {
            date: d[1],
            hour: d[2],
            sensor: d[3],
        })
    );
    return { newMaxTime: { date: maxDate, hour: maxHour }, newData };
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

const utilityFunctions = {
    sectionize: _sectionize,
    mergeTimeColumns: _mergeTimeColumns,
    renderTimeLabel: _renderTimeLabel,
};

export default utilityFunctions;
