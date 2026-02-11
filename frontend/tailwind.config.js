/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0B0F1A', // Space Black (Background)
                    800: '#1B1F3B', // Deep Blue (Secondary)
                    700: '#2A3047', // Lighter shade
                    600: '#3E4C6E', // Even lighter (for hover)
                    500: '#556488',
                },
                neon: {
                    green: '#00F5D4', // Neon Cyan (Primary)
                    cyan: '#2EC4B6', // Teal (Accent)
                    purple: '#8b5cf6', // Violet
                    success: '#00FF88', // Bright Green
                    error: '#FF4D4D', // Bright Red
                }
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out',
                'fade-in-down': 'fadeInDown 0.5s ease-out',
                'scan-line': 'scanLine 2s linear infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scanLine: {
                    '0%': { top: '0%' },
                    '100%': { top: '100%' },
                }
            }
        },
    },
    plugins: [],
}
