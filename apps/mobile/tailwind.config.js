/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0284c7',
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                background: '#ffffff',
                foreground: '#0a0a0a',
                muted: {
                    DEFAULT: '#f5f5f5',
                    foreground: '#737373',
                },
                border: '#e5e5e5',
                destructive: {
                    DEFAULT: '#ef4444',
                    foreground: '#ffffff',
                },
            },
        },
    },
    plugins: [],
}
