/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        attentionCalm: '#22c55e',
        attentionWatch: '#eab308', 
        attentionAlert: '#f97316',
        attentionCritical: '#ef4444'
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
          '50%': { opacity: .8, boxShadow: '0 0 10px 5px rgba(239, 68, 68, 0.1)' },
        }
      }
    },
  },
  plugins: [],
}
