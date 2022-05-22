import React from 'react';

type TimeBucket = '24 hours' | '6 hours' | '2 hours' | '30 minutes' | '10 minutes';
const times: TimeBucket[] = [
    '10 minutes',
    '30 minutes',
    '2 hours',
    '6 hours',
    '24 hours',
];

const TimeSelector = (props: {
    selectedTime: TimeBucket;
    setSelectedTime(s: TimeBucket): void;
}) => {
    return (
        <div className="flex -mt-4 gap-x-1">
            <span className="pr-0.5">Show the latest:</span>
            {times.map((t) => (
                <button
                    className={
                        'px-2 py-0.5 border rounded-md border-slate-300 text-sm ' +
                        (props.selectedTime === t
                            ? 'bg-white text-slate-950 shadow-sm '
                            : 'bg-slate-150 text-slate-500')
                    }
                    onClick={() => props.setSelectedTime(t)}
                >
                    {t}
                </button>
            ))}
        </div>
    );
};

export default TimeSelector;
