import React from 'react';
import { CONSTANTS, TYPES } from '../utilities/constants';

const TimeSelector = (props: {
    selectedTime: TYPES.TimeBucket;
    setSelectedTime(s: TYPES.TimeBucket): void;
}) => {
    return (
        <div
            className={
                'text-sm border divide-x rounded-md ' +
                'shadow-sm bg-slate-100 flex-row-center divide-slate-300 ' +
                'text-slate-400 border-slate-300 my-1 whitespace-nowrap'
            }
        >
            {CONSTANTS.TIMES.map((t) => (
                <button
                    key={t}
                    className={
                        'px-2 py-1 ' +
                        (props.selectedTime === t
                            ? 'bg-white first:rounded-l-md last:rounded-r-md text-black '
                            : '')
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
