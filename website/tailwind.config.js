module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                'green-950': '#0a2916',
                'slate-950': '#070b15',
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
