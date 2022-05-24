import { uniq, min, max, range } from 'lodash';
import * as d3 from 'd3';
import transformTimeseries from './transform-timeseries';
import { CONSTANTS } from './constants';

export const plotCircles = (
    svg: any,
    column_name: string,
    data: { [key: string]: number | string }[],
    options: {
        decimalPlaces: number;
        minimumY: number | undefined;
        detectionLimit: number | undefined;
    }
) => {
    const sensorNames = uniq(data.map((d) => d['sensor'])).sort();
    console.log({ column_name, options });

    _plotLines(svg);

    CONSTANTS.TIMES.forEach((time) => {
        const _maxX: any = max(data.map((d) => d['hour']));
        const _minX: any = _maxX - CONSTANTS.HOUR_FRACTIONS[time];
        const _deltaX = _maxX - _minX;

        const _data = data.filter((d) => d['hour'] >= _minX);

        let _maxY: any = max(_data.map((d) => d[column_name]));
        let _minY: any = min(_data.map((d) => d[column_name]));
        let _deltaY: number = _maxY - _minY;
        _maxY += 0.1 * _deltaY;
        _minY -= 0.1 * _deltaY;
        if (options.minimumY !== undefined) {
            _minY = max([options.minimumY, _minY]);
        }
        _deltaY = _maxY - _minY;

        const _xScale: (x: number) => number = d3
            .scaleLinear()
            .domain([_minX, _maxX])
            .range([40, 380]);
        const _yScale: (x: number) => number = d3
            .scaleLinear()
            .domain([_maxY, _minY])
            .range([CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX]);

        const timedClasses = {
            labelGroup: `label-group-${time.replace(' ', '-')}`,
            circleGroup: `circle-group-${time.replace(' ', '-')}`,
        };
        const indexedClasses = {
            lineGroup: (index: number) => `line-group-${index}`,
            labelGroup: (index: number) => `label-group-${index}`,
            circleGroup: (index: number) => `circle-group-${index}`,
        };

        let _timedLabelGroup: any = svg.selectAll(`.${timedClasses.labelGroup}`);
        if (!_timedLabelGroup.empty()) {
            _timedLabelGroup.remove();
        }
        _timedLabelGroup = svg
            .append('g')
            .attr('class', `${timedClasses.labelGroup} text-slate-800 z-0`);

        function _plotLabel(
            x: number,
            y: number,
            text: string,
            align: 'middle' | 'end'
        ) {
            _timedLabelGroup
                .append('text')
                .style('text-anchor', align)
                .attr('class', 'text-[0.45rem] font-mono')
                .attr('x', x)
                .attr('y', y + 2.5)
                .text(text);
        }
        sectionize(40, 380, 4).forEach((x, index) => {
            const _xLabel = transformTimeseries.renderTimeLabel(
                _minX + (index / 4) * _deltaX
            );
            _plotLabel(x, CONSTANTS.PLOT_Y_MAX + 17, _xLabel, 'middle');
        });
        sectionize(CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX, 5).forEach(
            (y, index) => {
                const _yLabel = _maxY - (index / 5) * _deltaY;
                _plotLabel(33, y, _yLabel.toFixed(options.decimalPlaces), 'end');
            }
        );

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
                    _xScale(d.x).toFixed(3)
                )
                .attr('cy', (d: { x: number; y: number }, i: number) =>
                    _yScale(d.y).toFixed(3)
                );

            // Remove old circle elements
            _circles.exit().remove();
        });
    });
};

function _plotLines(svg: any) {
    let _lineGroup: any = svg.selectAll(`.line-group`);

    // remove all old plots, every time this function is called
    if (!_lineGroup.empty()) {
        _lineGroup.remove();
    }
    _lineGroup = svg.append('g').attr('class', `line-group fill-slate-600 z-0`);

    // vertical lines
    sectionize(40, 380, 20).forEach((x, index) => {
        // full height lines
        _plotLine(_lineGroup, {
            x1: x,
            x2: x,
            y1: CONSTANTS.PLOT_Y_MIN,
            y2: CONSTANTS.PLOT_Y_MAX,
            bold: index === 0 || index === 20,
        });
        if (index % 5 === 0) {
            // appendix at label position
            _plotLine(_lineGroup, {
                x1: x,
                x2: x,
                y1: CONSTANTS.PLOT_Y_MAX,
                y2: CONSTANTS.PLOT_Y_MAX + 10,
                bold: true,
            });
        }
    });
    // horizontal lines
    sectionize(CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX, 10).forEach((y, index) => {
        // full width lines
        _plotLine(_lineGroup, {
            x1: 40,
            x2: 380,
            y1: y,
            y2: y,
            bold: index === 0 || index === 10,
        });
        if (index % 2 === 0) {
            // appendix at label position
            _plotLine(_lineGroup, { x1: 36.5, x2: 40, y1: y, y2: y, bold: true });
        }
    });
}

function _plotLine(
    group: any,
    options: {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
        bold: boolean;
    }
) {
    group
        .append('line')
        .attr('class', 'x-axis-line ' + (options.bold ? '' : 'opacity-[35%]'))
        .attr('stroke', '#334155')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', options.bold ? 1 : 0.5)
        .attr('x1', options.x1)
        .attr('x2', options.x2)
        .attr('y1', options.y1)
        .attr('y2', options.y2);
}

function sectionize(from: number, to: number, steps: number) {
    return range(from, to + 1, (to - from) / steps);
}
