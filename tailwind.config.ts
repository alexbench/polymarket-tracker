import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#fafafa',
        card: '#141414',
        'card-hover': '#1a1a1a',
        border: '#262626',
        'border-hover': '#333333',
        muted: '#171717',
        'muted-foreground': '#a3a3a3',
        accent: '#22c55e',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
    },
  },
  plugins: [],
}

export default config
