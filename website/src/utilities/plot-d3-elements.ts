import { uniq, min, max } from 'lodash';
import * as d3 from 'd3';

export const plotCircles = (
    svg: any,
    data: { [key: string]: number | string }[],
    column_name: string
) => {
    const minY: any = min(data.map((d) => d[column_name]));
    const maxY: any = max(data.map((d) => d[column_name]));

    const maxX: any = max(data.map((d) => d['hour']));
    const minX: any = maxX - 2;

    const xScale: (x: number) => number = d3.scaleLinear().domain([minX, maxX]).range([0, 400]);
    const yScale: (x: number) => number = d3.scaleLinear().domain([minY, maxY]).range([0, 120]);

    uniq(data.map((d) => d['sensor'])).forEach((sensorName) => {
        const sensorData = data
            .filter((d) => d['sensor'] === sensorName)
            .map((d) => ({ x: d['hour'], y: d[column_name] }));

        let circleGroup: any = svg.selectAll(`.circle-${sensorName}`);
        if (circleGroup.empty()) {
            circleGroup = svg.append('g').attr('class', `pointer-events-none`).attr('fill', 'red');
        }

        let circles: any = circleGroup.selectAll(`circle`).data(sensorData);
        circles
            .enter()
            .append('circle')
            .attr('r', 1.25)

            // Keep all circles in sync with the data
            .merge(circles)
            .attr('cx', (d: { x: number; y: number }, i: number) => xScale(d.x).toFixed(2))
            .attr('cy', (d: { x: number; y: number }, i: number) => yScale(d.y).toFixed(2));

        // Remove old circle elements
        circles.exit().remove();
    });
};
