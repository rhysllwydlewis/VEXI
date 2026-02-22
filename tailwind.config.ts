import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0e1a',
          800: '#0f172a',
          700: '#1e293b',
        },
      },
      animation: {
        blob1: 'blob1 20s infinite ease-in-out',
        blob2: 'blob2 25s infinite ease-in-out',
        blob3: 'blob3 30s infinite ease-in-out',
        float: 'float 20s infinite ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
        shimmer: 'shimmer 2.5s infinite',
      },
      keyframes: {
        blob1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '75%': { transform: 'translate(50px, 30px) scale(1.05)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-40px, 30px) scale(1.15)' },
          '66%': { transform: 'translate(20px, -40px) scale(0.85)' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '20%': { transform: 'translate(40px, 20px) scale(1.1)' },
          '40%': { transform: 'translate(-30px, -30px) scale(0.95)' },
          '60%': { transform: 'translate(20px, 40px) scale(1.05)' },
          '80%': { transform: 'translate(-40px, 10px) scale(0.9)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(var(--float-x, 10px), var(--float-y, -20px))' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
