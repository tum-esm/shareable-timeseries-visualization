import utilityFunctions from '../utility-functions';
import { CONSTANTS } from '../constants';

function plotLabels(
    svg: any,
    options: { className: string; decimalPlaces: number },
    range: {
        minX: number;
        deltaX: number;
        maxY: number;
        deltaY: number;
    }
) {
    // remove all old plots, every time this function is called
    let _timedLabelGroup: any = svg.selectAll(`.${options.className}`);
    if (!_timedLabelGroup.empty()) {
        _timedLabelGroup.remove();
    }
    _timedLabelGroup = svg
        .append('g')
        .attr('class', `${options.className} text-slate-800 z-0`);

    // x labels
    utilityFunctions.sectionize(40, 380, 4).forEach((x, index) => {
        const _xLabel = utilityFunctions.renderTimeLabel(
            range.minX + (index / 4) * range.deltaX
        );
        _plotLabel(_timedLabelGroup, {
            x: x,
            y: CONSTANTS.PLOT_Y_MAX + 17,
            text: _xLabel,
            align: 'middle',
        });
    });

    // y labels
    utilityFunctions
        .sectionize(CONSTANTS.PLOT_Y_MIN, CONSTANTS.PLOT_Y_MAX, 5)
        .forEach((y, index) => {
            const _yLabel = range.maxY - (index / 5) * range.deltaY;
            _plotLabel(_timedLabelGroup, {
                x: 33,
                y: y,
                text: _yLabel.toFixed(options.decimalPlaces),
                align: 'end',
            });
        });
}

function _plotLabel(
    group: any,
    options: { x: number; y: number; text: string; align: 'middle' | 'end' }
) {
    group
        .append('text')
        .style('text-anchor', options.align)
        .attr('class', 'text-[0.45rem] font-mono')
        .attr('x', options.x)
        .attr('y', options.y + 2.5)
        .text(options.text);
}

export default plotLabels;
