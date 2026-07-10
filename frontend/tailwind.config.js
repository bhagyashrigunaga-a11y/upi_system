module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 25px 60px rgba(15, 23, 42, 0.25)',
      },
      backgroundImage: {
        'dashboard-gradient': 'radial-gradient(circle at top, rgba(99, 102, 241, 0.2), transparent 38%), radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.15), transparent 25%)',
      },
      colors: {
        surface: '#0b1324',
      },
    },
  },
  plugins: [],
};
