import React from 'react';
import { CONSTANTS } from '../utilities/constants';

function _Checkbox(props: {
    label: string;
    value: boolean;
    setValue(b: boolean): void;
    sensorIndex: number;
}) {
    return (
        <button
            className={
                'relative flex-row-center px-3 py-1 first:rounded-l-md last:rounded-r-md ' +
                ' border border-slate-300 -ml-px first:ml-0 shadow-sm ' +
                (props.value ? 'bg-white ' : 'bg-slate-100 opacity-60 ')
            }
            onClick={() => props.setValue(!props.value)}
        >
            <div
                className={
                    'h-2.5 w-2.5 rounded-sm flex-shrink-0 ' +
                    CONSTANTS.BG_COLORS[props.sensorIndex]
                }
            />
            <div
                className={
                    'ml-1.5 text-sm font-medium ' +
                    CONSTANTS.TEXT_COLORS[props.sensorIndex]
                }
            >
                {props.label}
            </div>
        </button>
    );
}

const SensorSelector = (props: {
    selectedSensors: { [key: string]: boolean };
    setSelectedSensors(s: { [key: string]: boolean }): void;
}) => {
    return (
        <div className={'flex-row-left flex-wrap gap-y-1 '}>
            {Object.keys(props.selectedSensors)
                .sort()
                .map((k, i) => (
                    <_Checkbox
                        key={k}
                        label={k}
                        value={props.selectedSensors[k]}
                        setValue={(v) =>
                            props.setSelectedSensors({
                                ...props.selectedSensors,
                                [k]: v,
                            })
                        }
                        sensorIndex={i}
                    />
                ))}
        </div>
    );
};

export default SensorSelector;
