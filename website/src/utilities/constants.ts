export namespace TYPES {
    export type TimeBucket =
        | '24 hours'
        | '6 hours'
        | '2 hours'
        | '30 minutes'
        | '10 minutes';
}

export const CONSTANTS: {
    API: string;
    HEX_COLORS: string[];
    TEXT_COLORS: string[];
    FOCUS_COLORS: string[];
    SVG_HEIGHT: number;
    PLOT_Y_MIN: number;
    PLOT_Y_MAX: number;
    TIMES: TYPES.TimeBucket[];
} = {
    API: 'https://stv-backend-iwtvwmhnyq-ew.a.run.app',
    HEX_COLORS: [
        '#f43f5e',
        '#a855f7',
        '#3b82f6',
        '#14b8a6',
        '#84cc16',
        '#f97316',
        '#ec4899',
        '#8b5cf6',
        '#0ea5e9',
        '#10b981',
        '#eab308',
        '#ef4444',
    ],
    TEXT_COLORS: [
        'text-rose-600',
        'text-purple-600',
        'text-blue-600',
        'text-teal-600',
        'text-lime-600',
        'text-orange-600',
        'text-pink-600',
        'text-violet-600',
        'text-sky-600',
        'text-emerald-600',
        'text-yellow-600',
        'text-red-600',
    ],
    FOCUS_COLORS: [
        'focus:ring-rose-500',
        'focus:ring-purple-500',
        'focus:ring-blue-500',
        'focus:ring-teal-500',
        'focus:ring-lime-500',
        'focus:ring-orange-500',
        'focus:ring-pink-500',
        'focus:ring-violet-500',
        'focus:ring-sky-500',
        'focus:ring-emerald-500',
        'focus:ring-yellow-500',
        'focus:ring-red-500',
    ],
    SVG_HEIGHT: 150,
    PLOT_Y_MIN: 5,
    PLOT_Y_MAX: 130,
    TIMES: ['10 minutes', '30 minutes', '2 hours', '6 hours', '24 hours'],
};
