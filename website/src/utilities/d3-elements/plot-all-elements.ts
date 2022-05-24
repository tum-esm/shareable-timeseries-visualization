import { uniq, min, max } from 'lodash';
import { CONSTANTS } from '../constants';
import plotLines from './plot-lines';
import plotLabels from './plot-labels';
import plotCircles from './plot-circles';

function plotAllElements(
    svg: any,
    column_name: string,
    data: { [key: string]: number | string }[],
    options: {
        decimalPlaces: number;
        minimumY: number | undefined;
        detectionLimit: number | undefined;
    }
) {
    const sensorNames: any[] = uniq(data.map((d) => d['sensor'])).sort();
    console.log({ column_name, options });

    const _allData = data.filter((d) => d[column_name] !== null);

    plotLines(svg);

    CONSTANTS.TIMES.forEach((time) => {
        const _maxX: any = max(_allData.map((d) => d['hour']));
        const _minX: any = _maxX - CONSTANTS.HOUR_FRACTIONS[time];
        let _data = _allData.filter((d) => d['hour'] >= _minX);

        let _maxY: any = max(_data.map((d) => d[column_name]));
        let _minY: any = min(_data.map((d) => d[column_name]));
        let _deltaY: number = _maxY - _minY;
        _maxY += 0.1 * _deltaY;
        _minY -= 0.1 * _deltaY;
        if (options.minimumY !== undefined) {
            _minY = max([options.minimumY, _minY]);
        }
        _data = _data.filter((d) => d[column_name] >= _minY);

        // final deltas
        let _deltaX: number = _maxX - _minX;
        _deltaY = _maxY - _minY;

        // one set of x and y labels for each time
        plotLabels(
            svg,
            {
                className: `label-group-${time.replace(' ', '-')}`,
                decimalPlaces: options.decimalPlaces,
            },
            { minX: _minX, deltaX: _deltaX, maxY: _maxY, deltaY: _deltaY }
        );

        // one set of circles for each time and sensor
        plotCircles(
            svg,
            _data,
            { time, sensorNames, column_name },
            { minX: _minX, maxX: _maxX, minY: _minY, maxY: _maxY }
        );
    });
}

export default plotAllElements;
