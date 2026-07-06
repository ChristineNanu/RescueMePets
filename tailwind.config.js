/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        teal:  { 50:'#f0fdfa',100:'#ccfbf1',200:'#99f6e4',300:'#5eead4',400:'#2dd4bf',500:'#14b8a6',600:'#0d9488',700:'#0f766e',800:'#115e59',900:'#134e4a' },
        coral: { 50:'#fff1f0',100:'#ffe4e1',200:'#ffc9c2',300:'#ffa59a',400:'#ff7b6b',500:'#ff5a47',600:'#f03a28',700:'#cc2a1a',800:'#a82316',900:'#8a1e13' },
        cream: { 50:'#fffdf7',100:'#fef9ec',200:'#fdf0cc',300:'#fce4a0',400:'#f9d06a',500:'#f5bc3a',600:'#e8a510',700:'#c48a0c',800:'#9e6e0a',900:'#7d5608' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'glow-teal':  '0 0 30px -5px rgba(20,184,166,0.35)',
        'glow-coral': '0 0 30px -5px rgba(255,90,71,0.35)',
        'card':       '0 4px 24px -4px rgba(0,0,0,0.08)',
        'card-hover': '0 16px 48px -8px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
}
