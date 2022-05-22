import React from 'react';
import { CONSTANTS, TYPES } from '../utilities/constants';

const TimeSelector = (props: {
    selectedTime: TYPES.TimeBucket;
    setSelectedTime(s: TYPES.TimeBucket): void;
}) => {
    return (
        <div className="flex -mt-4 gap-x-1">
            <span className="pr-0.5">Show the latest:</span>
            {CONSTANTS.TIMES.map((t) => (
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
