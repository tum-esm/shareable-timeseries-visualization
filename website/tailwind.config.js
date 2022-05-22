module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'blue-150': '#cde2fe',
                'green-950': '#0a2916',
                'slate-75': '#f4f7fa',
                'slate-150': '#e9eef4',
                'slate-950': '#070b15',
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
