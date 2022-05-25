import { min, range } from 'lodash';
import * as d3 from 'd3';
import { CONSTANTS, TYPES } from '../constants';

function plotCircles(
    svg: any,
    _data: TYPES.DATA,
    options: {
        time: TYPES.TimeBucket;
        sensorNames: string[];
        column_name: string;
    },
    _range: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    }
) {
    const _xScale: (x: number) => number = d3
        .scaleLinear()
        .domain([_range.minX, _range.maxX])
        .range([CONSTANTS.PLOT.xMin, CONSTANTS.PLOT.xMax]);
    const _yScale: (x: number) => number = d3
        .scaleLinear()
        .domain([_range.maxY, _range.minY])
        .range([CONSTANTS.PLOT.yMin, CONSTANTS.PLOT.yMax]);

    const timedCircleClasses = `circle-group-${options.time.replace(' ', '-')}`;
    const indexedCircleClass = (index: number) => `circle-group-${index}`;

    // for each sensor, one group for the current time bucket
    let _timedCircleGroups: any = svg
        .selectAll(`.${timedCircleClasses}`)
        .data(range(0, min([options.sensorNames.length, 12])));
    _timedCircleGroups
        .enter()
        .append('g')

        // Keep all circles in sync with the data
        .merge(_timedCircleGroups)
        .attr(
            'class',
            (index: number) => `${timedCircleClasses} ${indexedCircleClass(index)} z-0`
        )
        .attr('fill', (index: number) => CONSTANTS.HEX_COLORS[index]);

    // Remove when sensors disappear
    _timedCircleGroups.exit().remove();

    options.sensorNames.forEach((sensorName, index) => {
        if (index >= 12) {
            return;
        }

        // select all circles for this sensor-index and time
        const _sensorData = _data
            .filter((d) => d['sensor'] === sensorName)
            .map((d) => ({ x: d['hour'], y: d[options.column_name] }));
        let _circleGroup: any = svg
            .selectAll(`.${timedCircleClasses}`)
            .filter(`.${indexedCircleClass(index)}`);
        let _circles: any = _circleGroup.selectAll(`circle`).data(_sensorData);

        _circles
            .enter()
            .append('circle')
            .attr('r', CONSTANTS.CIRCLE_RADII[options.time])

            // Keep all circles in sync with the data
            .merge(_circles)
            .attr('cx', (d: { x: number; y: number }, i: number) =>
                _xScale(d.x).toFixed(3)
            )
            .attr('cy', (d: { x: number; y: number }, i: number) =>
                _yScale(d.y).toFixed(3)
            );

        // Remove when data points for this sensor-index and time disappear
        _circles.exit().remove();
    });
}

export default plotCircles;
