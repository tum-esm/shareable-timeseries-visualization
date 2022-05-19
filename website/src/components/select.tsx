import React from 'react';

export default function Select(props: {
    label: string;
    options: string[];
    selectedIndex: number | undefined;
    setSelectedIndex(i: number): void;
}) {
    const { options, selectedIndex, setSelectedIndex } = props;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{props.label}</label>
            <select
                name="location"
                className="block w-full py-2 pl-3 pr-10 mt-1 text-base border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedIndex !== undefined ? options[selectedIndex] : undefined}
                onSelect={(e: any) => setSelectedIndex(options.findIndex(e.target.value))}
            >
                {options.map((v, i) => (
                    <option value={i}>{v}</option>
                ))}
            </select>
        </div>
    );
}
