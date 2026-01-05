/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Matrix Neon Color Palette - как в академии
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Orbitron', 'sans-serif'],
                mono: ['JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 3s infinite',
                'float': 'float-premium 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': {
                        boxShadow: '0 0 20px hsl(142, 76%, 52%, 0.4), 0 0 40px hsl(142, 76%, 52%, 0.2)'
                    },
                    '50%': {
                        boxShadow: '0 0 30px hsl(142, 76%, 52%, 0.6), 0 0 60px hsl(142, 76%, 52%, 0.4)'
                    },
                },
                shimmer: {
                    '0%': { left: '-100%' },
                    '100%': { left: '100%' },
                },
                'float-premium': {
                    '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                    '25%': { transform: 'translateY(-6px) rotate(1deg)' },
                    '75%': { transform: 'translateY(-3px) rotate(-1deg)' },
                },
            },
            boxShadow: {
                'neon': '0 0 20px -5px hsl(142, 76%, 52%, 0.4), 0 0 40px -10px hsl(142, 76%, 52%, 0.2)',
                'neon-intense': '0 0 30px -5px hsl(142, 76%, 52%, 0.6), 0 0 60px -10px hsl(142, 76%, 52%, 0.4)',
                'glow': '0 0 40px -10px hsl(142, 76%, 52%, 0.5)',
            },
        },
    },
    plugins: [],
}
