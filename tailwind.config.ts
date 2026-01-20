import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-hover': '#f8fafc',
        border: '#e2e8f0',
        'border-hover': '#cbd5e1',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        accent: '#2563eb',
        'accent-foreground': '#ffffff',
        destructive: '#ef4444',
        'destructive-foreground': '#ffffff',
      },
    },
  },
  plugins: [],
}

export default config
