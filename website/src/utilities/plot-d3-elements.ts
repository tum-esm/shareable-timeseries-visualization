import { uniq, min, max } from 'lodash';
import * as d3 from 'd3';

// rose, purple, blue, teal, lime, orange
//
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
        .range([0, 400]);
    const yScale: (x: number) => number = d3
        .scaleLinear()
        .domain([minY - 0.1 * deltaY, maxY + 0.1 * deltaY])
        .range([0, 120]);

    const sensor_names = uniq(data.map((d) => d['sensor'])).sort();

    sensor_names.forEach((sensorName, i) => {
        if (i >= 12) {
            return;
        }
        const sensorData = data
            .filter((d) => d['sensor'] === sensorName)
            .map((d) => ({ x: d['hour'], y: d[column_name] }));

        let circleGroup: any = svg.selectAll(`.circle-${sensorName}`);
        if (circleGroup.empty()) {
            circleGroup = svg
                .append('g')
                .attr('class', `.circle-${sensorName}`)
                .attr('fill', COLORS[i]);
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
