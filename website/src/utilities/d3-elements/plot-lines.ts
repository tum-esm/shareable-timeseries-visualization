import { CONSTANTS } from '../constants';
import utilityFunctions from '../utility-functions';

function plotLines(svg: any) {
    let _lineGroup: any = svg.selectAll(`.line-group`);

    // remove all old plots, every time this function is called
    if (!_lineGroup.empty()) {
        _lineGroup.remove();
    }
    _lineGroup = svg.append('g').attr('class', `line-group fill-slate-600 z-0`);

    // vertical lines
    utilityFunctions.sectionize(40, 380, 20).forEach((x, index) => {
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
    utilityFunctions
        .sectionize(CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX, 10)
        .forEach((y, index) => {
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

export default plotLines;
