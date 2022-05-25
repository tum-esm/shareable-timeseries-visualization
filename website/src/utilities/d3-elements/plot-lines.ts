import { CONSTANTS } from '../constants';
import utilityFunctions from '../utility-functions';

function plotLines(svg: any) {
    let _lineGroup: any = svg.selectAll(`.line-group`);

    // remove all old plots, every time this function is called
    if (!_lineGroup.empty()) {
        _lineGroup.remove();
    }
    _lineGroup = svg.append('g').attr('class', `line-group fill-slate-600 z-20`);
    _plotBorders(_lineGroup);

    // vertical lines
    utilityFunctions
        .sectionize(CONSTANTS.PLOT.xMin, CONSTANTS.PLOT.xMax, 20)
        .forEach((x, index) => {
            // full height lines
            _plotLine(_lineGroup, {
                x1: x,
                x2: x,
                y1: CONSTANTS.PLOT.yMin,
                y2: CONSTANTS.PLOT.yMax,
                bold: index === 0 || index === 20,
            });
            if (index % 5 === 0) {
                // appendix at label position
                _plotLine(_lineGroup, {
                    x1: x,
                    x2: x,
                    y1: CONSTANTS.PLOT.yMax,
                    y2: CONSTANTS.PLOT.yMax + 10,
                    bold: true,
                });
            }
        });
    // horizontal lines
    utilityFunctions
        .sectionize(CONSTANTS.PLOT.yMin, CONSTANTS.PLOT.yMax, 10)
        .forEach((y, index) => {
            // full width lines
            _plotLine(_lineGroup, {
                x1: CONSTANTS.PLOT.xMin,
                x2: CONSTANTS.PLOT.xMax,
                y1: y,
                y2: y,
                bold: index === 0 || index === 10,
            });
            if (index % 2 === 0) {
                // appendix at label position
                _plotLine(_lineGroup, {
                    x1: CONSTANTS.PLOT.xMin - 3.5,
                    x2: CONSTANTS.PLOT.xMin,
                    y1: y,
                    y2: y,
                    bold: true,
                });
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
        .attr('class', 'x-axis-line ' + (options.bold ? ' ' : 'opacity-[35%] '))
        .attr('stroke', '#334155')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', options.bold ? 1 : 0.5)
        .attr('x1', options.x1)
        .attr('x2', options.x2)
        .attr('y1', options.y1)
        .attr('y2', options.y2);
}

function _plotBorders(group: any) {
    const f = (points: string) => {
        group
            .append('polyline')
            .attr('style', 'fill:white;stroke:0;opacity:100%;z-index:10;')
            .attr('points', points);
    };
    // left
    f(
        `0,0 ` +
            `${CONSTANTS.PLOT.xMin},0 ` +
            `${CONSTANTS.PLOT.xMin},${CONSTANTS.PLOT.height} ` +
            `0,${CONSTANTS.PLOT.height}`
    );
    // right
    f(
        `${CONSTANTS.PLOT.width},0 ` +
            `${CONSTANTS.PLOT.xMax},0 ` +
            `${CONSTANTS.PLOT.xMax},${CONSTANTS.PLOT.height} ` +
            `${CONSTANTS.PLOT.width},${CONSTANTS.PLOT.height}`
    );
    // top
    f(
        `0,0 ` +
            `0,${CONSTANTS.PLOT.yMin} ` +
            `${CONSTANTS.PLOT.width},${CONSTANTS.PLOT.yMin} ` +
            `${CONSTANTS.PLOT.width},0`
    );
    // bottom
    f(
        `0,${CONSTANTS.PLOT.height} ` +
            `0,${CONSTANTS.PLOT.yMax} ` +
            `${CONSTANTS.PLOT.width},${CONSTANTS.PLOT.yMax}, ` +
            `${CONSTANTS.PLOT.width},${CONSTANTS.PLOT.height}`
    );
}

export default plotLines;
