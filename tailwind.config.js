module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'supabase-radial': 'radial-gradient(circle, rgba(36,180,126,1) 0%, rgba(29,94,70,1) 0%, rgba(24,24,24,1) 100%)',
      }
    },
  },
  plugins: [],
}
