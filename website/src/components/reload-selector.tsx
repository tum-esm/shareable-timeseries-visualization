import React, { useEffect, useState } from 'react';
import icons from '../assets/icons';
import { TYPES } from '../utilities/constants';
import utilityFunctions from '../utilities/utility-functions';

const ReloadSelector = (props: {
    maxTime: TYPES.MAX_TIME;
    autoReload: boolean;
    setAutoReload(a: boolean): void;
    isReloading: boolean;
    triggerManualReload(): void;
}) => {
    return (
        <div
            className={
                'text-sm rounded-md whitespace-nowrap flex flex-col justify-end items-end gap-y-1'
            }
        >
            <div className="flex-row-center">
                <span className="mr-0.5 font-normal">Newest data: </span>
                <span className="font-medium">
                    {props.maxTime.date},{' '}
                    {utilityFunctions.renderTimeLabel(props.maxTime.hour)} (UTC)
                </span>
            </div>
            <div className="flex-row-center gap-x-1">
                <button
                    className={
                        'px-3 py-1 flex-row-center border border-slate-300 rounded-md ' +
                        'font-medium shadow-sm ' +
                        (props.autoReload
                            ? 'bg-white text-black '
                            : 'bg-slate-100 text-slate-500 ')
                    }
                    onClick={() => props.setAutoReload(!props.autoReload)}
                >
                    {props.autoReload && (
                        <div className="-ml-0.5 mr-1.5 relative h-2.5 w-2.5">
                            <div
                                className={
                                    'absolute w-full h-full rounded-full animate-ping ' +
                                    (props.isReloading ? 'bg-blue-600 ' : 'bg-rose-600')
                                }
                            />
                            <div
                                className={
                                    'absolute w-full h-full rounded-full opacity-70 ' +
                                    (props.isReloading
                                        ? 'bg-blue-600 '
                                        : 'bg-rose-600 ')
                                }
                            />
                        </div>
                    )}
                    {!props.autoReload && (
                        <div className="-ml-0.5 mr-1.5 relative h-2.5 w-2.5 bg-slate-200 rounded-full" />
                    )}
                    Realtime Updates
                </button>

                <button
                    className={
                        'p-1 border rounded-md shadow-sm border-slate-300 ' +
                        (props.isReloading
                            ? 'bg-slate-100 text-slate-500 '
                            : 'bg-white text-black ')
                    }
                    onClick={() =>
                        props.isReloading ? () => {} : props.triggerManualReload()
                    }
                >
                    <div className="w-5 h-5 p-0.5">{icons.refresh}</div>
                </button>
            </div>
        </div>
    );
};

export default ReloadSelector;
