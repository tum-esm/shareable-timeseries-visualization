import { max, omit } from 'lodash';

const _timeLabels = (rawData: { [key: string]: any }[]) => {
    const maxDate = max(rawData.map((d) => d['date']));
    return rawData.map((d) => ({
        ...omit(d, ['ID', 'date', 'hour']),
        hour: d['date'] === maxDate ? d['hour'] : d['hour'] - 24,
    }));
};

const transformTimeseries = {
    timeLabels: _timeLabels,
};

export default transformTimeseries;
