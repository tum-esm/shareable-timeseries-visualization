import React from 'react';

export default function Checkbox(props: {
    label: string;
    value: boolean;
    setValue(b: boolean): void;
}) {
    return (
        <div className="relative flex items-start">
            <div className="flex items-center h-5">
                <input
                    id="candidates"
                    aria-describedby="candidates-description"
                    name="candidates"
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={props.value}
                    onChange={() => props.setValue(!props.value)}
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor="candidates" className="font-medium text-gray-700">
                    {props.label}
                </label>
            </div>
        </div>
    );
}
