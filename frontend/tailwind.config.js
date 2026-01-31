/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dark-bg': '#0a0a0f',
                'card-bg': '#1c1c26',
                'primary': '#7c3aed', // Violet 600
                'primary-hover': '#6d28d9',
                'accent': '#8b5cf6', // Violet 500
                'success': '#10b981', // Emerald 500
                'warning': '#f59e0b', // Amber 500
                'danger': '#ef4444', // Red 500
                'text-muted': '#9ca3af', // Gray 400
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2a2a42 0deg, #0a0a0f 180deg)',
            }
        },
    },
    plugins: [],
}
