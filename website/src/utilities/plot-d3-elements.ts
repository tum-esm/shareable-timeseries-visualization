import { uniq, min, max, range } from 'lodash';
import * as d3 from 'd3';

// rose, purple, blue, teal, lime, orange
// pink, violet, sky, emerald, yellow, red
const COLORS = [
    '#f43f5e',
    '#a855f7',
    '#3b82f6',
    '#14b8a6',
    '#84cc16',
    '#f97316',
    '#ec4899',
    '#8b5cf6',
    '#0ea5e9',
    '#10b981',
    '#eab308',
    '#ef4444',
];

export const plotCircles = (
    svg: any,
    data: { [key: string]: number | string }[],
    column_name: string
) => {
    const minY: any = min(data.map((d) => d[column_name]));
    const maxY: any = max(data.map((d) => d[column_name]));
    const deltaY = maxY - minY;

    const maxX: any = max(data.map((d) => d['hour']));
    const minX: any = maxX - 2;
    const deltaX = maxX - minX;

    const xScale: (x: number) => number = d3
        .scaleLinear()
        .domain([minX - 0.1 * deltaX, maxX + 0.1 * deltaX])
        .range([50, 380]);
    const yScale: (x: number) => number = d3
        .scaleLinear()
        .domain([maxY + 0.1 * deltaY, minY - 0.1 * deltaY])
        .range([5, 100]);

    const sensorNames = uniq(data.map((d) => d['sensor'])).sort();

    // TODO: Plot x and y axis and labels

    let lineGroup: any = svg.selectAll(`.line-group`);
    let labelGroup: any = svg.selectAll(`.label-group`);
    if (!lineGroup.empty()) {
        lineGroup.remove();
    }
    if (!labelGroup.empty()) {
        labelGroup.remove();
    }

    lineGroup = svg.append('g').attr('class', `line-group fill-gray-600 z-0`);
    labelGroup = svg.append('g').attr('class', `label-group text-gray-800 z-0`);
    function _plotLine(x1: number, x2: number, y1: number, y2: number, bold: boolean) {
        lineGroup
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
    function _plotLabel(x: number, y: number, text: string, align: 'middle' | 'end') {
        labelGroup
            .append('text')
            .style('text-anchor', align)
            .attr('class', 'text-[0.45rem] font-mono')
            .attr('x', x)
            .attr('y', y + 2.5)
            .text(text);
    }
    range(50, 381, 16.5).forEach((x, index) => {
        _plotLine(x, x, 5, index % 4 == 0 ? 103.5 : 100, [50, 380].includes(x));
        if (index % 4 === 0) {
            _plotLine(x, x, 100, 110, true);
            let _xHour = minX + (index / 20.0) * deltaX;
            if (_xHour < 0) {
                _xHour += 24;
            }
            const _hours = Math.floor(_xHour);
            const _minutes = Math.floor((_xHour - _hours) * 60);
            const _seconds = Math.floor(((_xHour - _hours) * 60 - _minutes) * 60);
            const _xLabel =
                `${_hours.toString().padStart(2, '0')}:` +
                `${_minutes.toString().padStart(2, '0')}:` +
                `${_seconds.toString().padStart(2, '0')}`;
            _plotLabel(x, 117, _xLabel, 'middle');
        }
    });
    range(5, 101, 9.5).forEach((y, index) => {
        _plotLine(50, 380, y, y, [5, 100].includes(y));
        if (index % 2 === 0) {
            _plotLine(46.5, 50, y, y, true);
            const _yLabel = maxY + 0.1 * deltaY - (index / 10.0) * 1.2 * deltaY;
            _plotLabel(43, y, _yLabel.toFixed(3), 'end');
        }
    });

    sensorNames.forEach((sensorName, index) => {
        if (index >= 12) {
            return;
        }
        const sensorData = data
            .filter((d) => d['sensor'] === sensorName)
            .map((d) => ({ x: d['hour'], y: d[column_name] }));

        let circleGroup: any = svg.selectAll(`.circle-group-${index}`);
        if (circleGroup.empty()) {
            circleGroup = svg
                .append('g')
                .attr('class', `circle-group-${index}`)
                .attr('fill', COLORS[index]);
        }

        let circles: any = circleGroup.selectAll(`circle`).data(sensorData);
        circles
            .enter()
            .append('circle')
            .attr('r', 1)

            // Keep all circles in sync with the data
            .merge(circles)
            .attr('cx', (d: { x: number; y: number }, i: number) => xScale(d.x).toFixed(2))
            .attr('cy', (d: { x: number; y: number }, i: number) => yScale(d.y).toFixed(2));

        // Remove old circle elements
        circles.exit().remove();
    });
};