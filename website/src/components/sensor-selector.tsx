import React from 'react';
import CONSTANTS from '../utilities/constants';

function _Checkbox(props: {
    label: string;
    value: boolean;
    setValue(b: boolean): void;
    sensorIndex: number;
}) {
    return (
        <div className="relative flex items-start">
            <div className="flex items-center h-5">
                <input
                    id={`sensor-checkbox-${props.sensorIndex}`}
                    aria-describedby="candidates-description"
                    name="candidates"
                    type="checkbox"
                    className={
                        'w-4 h-4 border-slate-300 rounded ' +
                        CONSTANTS.TEXT_COLORS[props.sensorIndex] +
                        ' ' +
                        CONSTANTS.FOCUS_COLORS[props.sensorIndex]
                    }
                    checked={props.value}
                    onChange={() => props.setValue(!props.value)}
                />
            </div>
            <div className="ml-1.5 text-sm">
                <label
                    htmlFor={`sensor-checkbox-${props.sensorIndex}`}
                    className={
                        'font-medium text-slate-700 ' +
                        CONSTANTS.TEXT_COLORS[props.sensorIndex]
                    }
                >
                    {props.label}
                </label>
            </div>
        </div>
    );
}

const SensorSelector = (props: {
    selectedSensors: { [key: string]: boolean };
    setSelectedSensors(s: { [key: string]: boolean }): void;
}) => {
    return (
        <div className="flex-wrap w-full flex-row-left gap-x-4 gap-y-1">
            <span className="-mr-2">Plot data from stations:</span>
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
