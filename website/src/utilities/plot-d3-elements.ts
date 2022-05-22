import { uniq, min, max, range } from 'lodash';
import * as d3 from 'd3';
import transformTimeseries from './transform-timeseries';
import { CONSTANTS } from './constants';

export const plotCircles = (
    svg: any,
    column_name: string,
    data: { [key: string]: number | string }[]
) => {
    const sensorNames = uniq(data.map((d) => d['sensor'])).sort();

    CONSTANTS.TIMES.forEach((time) => {
        const _maxX: any = max(data.map((d) => d['hour']));
        const _minX: any = _maxX - CONSTANTS.HOUR_FRACTIONS[time];
        const _deltaX = _maxX - _minX;

        const _data = data.filter((d) => d['hour'] >= _minX);
        const _minY: any = min(_data.map((d) => d[column_name]));
        const _maxY: any = max(_data.map((d) => d[column_name]));
        const _deltaY = _maxY - _minY;

        const _xScale: (x: number) => number = d3
            .scaleLinear()
            .domain([_minX, _maxX])
            .range([40, 380]);
        const _yScale: (x: number) => number = d3
            .scaleLinear()
            .domain([_maxY + 0.1 * _deltaY, _minY - 0.1 * _deltaY])
            .range([CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX]);

        const timedClasses = {
            lineGroup: `line-group-${time.replace(' ', '-')}`,
            labelGroup: `label-group-${time.replace(' ', '-')}`,
            circleGroup: `circle-group-${time.replace(' ', '-')}`,
        };
        const indexedClasses = {
            lineGroup: (index: number) => `line-group-${index}`,
            labelGroup: (index: number) => `label-group-${index}`,
            circleGroup: (index: number) => `circle-group-${index}`,
        };
        let _lineGroup: any = svg.selectAll(`.${timedClasses.lineGroup}`);
        let _labelGroup: any = svg.selectAll(`.${timedClasses.labelGroup}`);
        if (!_lineGroup.empty()) {
            _lineGroup.remove();
        }
        if (!_labelGroup.empty()) {
            _labelGroup.remove();
        }
        _lineGroup = svg
            .append('g')
            .attr('class', `${timedClasses.lineGroup} fill-slate-600 z-0`);
        _labelGroup = svg
            .append('g')
            .attr('class', `${timedClasses.labelGroup} text-slate-800 z-0`);
        function _plotLine(
            x1: number,
            x2: number,
            y1: number,
            y2: number,
            bold: boolean
        ) {
            _lineGroup
                .append('line')
                .attr('class', 'x-axis-line ' + (bold ? '' : 'opacity-[35%]'))
                .attr('stroke', '#334155')
                .attr('stroke-linecap', 'round')
                .attr('stroke-width', bold ? 1 : 0.5)
                .attr('x1', x1)
                .attr('x2', x2)
                .attr('y1', y1)
                .attr('y2', y2);
        }
        function _plotLabel(
            x: number,
            y: number,
            text: string,
            align: 'middle' | 'end'
        ) {
            _labelGroup
                .append('text')
                .style('text-anchor', align)
                .attr('class', 'text-[0.45rem] font-mono')
                .attr('x', x)
                .attr('y', y + 2.5)
                .text(text);
        }
        range(40, 381, 17).forEach((x, index) => {
            _plotLine(
                x,
                x,
                CONSTANTS.PLOT_Y_MIN,
                CONSTANTS.PLOT_Y_MAX,
                [40, 380].includes(x)
            );
            if (index % 5 === 0) {
                _plotLine(x, x, CONSTANTS.PLOT_Y_MAX, CONSTANTS.PLOT_Y_MAX + 10, true);
                const _xLabel = transformTimeseries.renderTimeLabel(
                    _minX + (index / 20.0) * _deltaX
                );
                _plotLabel(x, CONSTANTS.PLOT_Y_MAX + 17, _xLabel, 'middle');
            }
        });
        range(
            CONSTANTS.PLOT_Y_MIN,
            CONSTANTS.PLOT_Y_MAX + 1,
            (CONSTANTS.PLOT_Y_MAX - CONSTANTS.PLOT_Y_MIN) / 10.0
        ).forEach((y, index) => {
            _plotLine(
                40,
                380,
                y,
                y,
                [CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX].includes(y)
            );
            if (index % 2 === 0) {
                _plotLine(36.5, 40, y, y, true);
                const _yLabel = _maxY + 0.1 * _deltaY - (index / 10.0) * 1.2 * _deltaY;
                _plotLabel(33, y, _yLabel.toFixed(3), 'end');
            }
        });

        let _circleGroups: any = svg
            .selectAll(`.${timedClasses.circleGroup}`)
            .data(range(0, min([sensorNames.length, 12])));
        _circleGroups
            .enter()
            .append('g')

            // Keep all circles in sync with the data
            .merge(_circleGroups)
            .attr(
                'class',
                (index: number) =>
                    `${timedClasses.circleGroup} ${indexedClasses.circleGroup(index)}`
            )
            .attr('fill', (index: number) => CONSTANTS.HEX_COLORS[index]);

        // Remove old circle group elements
        _circleGroups.exit().remove();

        sensorNames.forEach((sensorName, index) => {
            if (index >= 12) {
                return;
            }
            const _sensorData = _data
                .filter((d) => d['sensor'] === sensorName && d['hour'] >= _minX)
                .map((d) => ({ x: d['hour'], y: d[column_name] }));

            let _circleGroup: any = svg
                .selectAll(`.${timedClasses.circleGroup}`)
                .filter(`.${indexedClasses.circleGroup(index)}`);
            let _circles: any = _circleGroup.selectAll(`circle`).data(_sensorData);
            _circles
                .enter()
                .append('circle')
                .attr('r', CONSTANTS.CIRCLE_RADII[time])

                // Keep all circles in sync with the data
                .merge(_circles)
                .attr('cx', (d: { x: number; y: number }, i: number) =>
                    _xScale(d.x).toFixed(2)
                )
                .attr('cy', (d: { x: number; y: number }, i: number) =>
                    _yScale(d.y).toFixed(2)
                );

            // Remove old circle elements
            _circles.exit().remove();
        });
    });
};
