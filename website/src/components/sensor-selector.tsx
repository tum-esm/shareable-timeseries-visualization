import React from 'react';

// rose, purple, blue, teal, lime, orange
// pink, violet, sky, emerald, yellow, red
const COLORS = [
    'text-rose-600 focus:ring-rose-500',
    'text-purple-600 focus:ring-purple-500',
    'text-blue-600 focus:ring-blue-500',
    'text-teal-600 focus:ring-teal-500',
    'text-lime-600 focus:ring-lime-500',
    'text-orange-600 focus:ring-orange-500',
    'text-pink-600 focus:ring-pink-500',
    'text-violet-600 focus:ring-violet-500',
    'text-sky-600 focus:ring-sky-500',
    'text-emerald-600 focus:ring-emerald-500',
    'text-yellow-600 focus:ring-yellow-500',
    'text-red-600 focus:ring-red-500',
];

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
                    id="candidates"
                    aria-describedby="candidates-description"
                    name="candidates"
                    type="checkbox"
                    className={'w-4 h-4 border-slate-300 rounded ' + COLORS[props.sensorIndex]}
                    checked={props.value}
                    onClick={() => props.setValue(!props.value)}
                />
            </div>
            <div className="ml-1.5 text-sm">
                <label htmlFor="candidates" className="font-medium text-slate-700">
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
        <div className="flex-wrap w-full flex-row-left gap-x-6 gap-y-2">
            {Object.keys(props.selectedSensors)
                .sort()
                .map((k, i) => (
                    <_Checkbox
                        key={k}
                        label={k}
                        value={props.selectedSensors[k]}
                        setValue={(v) =>
                            props.setSelectedSensors({ ...props.selectedSensors, [k]: v })
                        }
                        sensorIndex={i}
                    />
                ))}
        </div>
    );
};

export default SensorSelector;
