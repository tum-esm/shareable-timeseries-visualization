import React from 'react';

const Input = (props: {
    label: string;
    value: string;
    setValue(s: string): void;
    type?: 'text' | 'password';
}) => {
    const { value, setValue, type } = props;

    return (
        <div className="flex-col-left">
            <label className="block text-sm font-medium text-slate-300">{props.label}:</label>
            <input
                type={type !== undefined ? type : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="rounded-md bg-slate-600 text-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1 px-3 py-1.5"
            />
        </div>
    );
};

export default Input;
