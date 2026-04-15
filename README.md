# The Cabinet — A Cocktail Companion

A virtual liquor cabinet and AI-powered cocktail suggestion app. Built with React + Vite, powered by the Anthropic API.

![The Cabinet](https://img.shields.io/badge/React-18-61dafb?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square) ![Anthropic](https://img.shields.io/badge/Anthropic-Claude-d4a843?style=flat-square)

---

## Features

### The Cabinet
Build and manage your virtual liquor cabinet. Add spirits, mixers, liqueurs, bitters, and garnishes — either by typing them in manually or using the Quick Add preset list covering the most common bar staples.

### Cocktail Suggestions
Enter a mood or leave it blank, then let the AI suggest three cocktails you can make right now with what you have on hand. Suggestions include both classic and original recipes, complete with ingredients, method, flavour profile, and a personalised note explaining why it suits your tastes.

### Tasting Notes
Rate every cocktail you try (1–5 stars) and add personal tasting notes. The app uses your ratings to personalise future suggestions — cocktails you've loved will influence the flavour profiles it recommends.

### Next Bottle
Based on your current cabinet and taste history, the AI recommends which bottles to buy next. Each recommendation includes a price range, a reason grounded in your preferences, and a list of cocktails it would unlock.

### Data Management
All data is stored locally in your browser. Export a JSON backup at any time, and import it back on any device.

---

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
git clone https://github.com/your-username/cocktail-cabinet.git
cd cocktail-cabinet
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Key Setup

1. Open the app and navigate to **Settings**
2. Paste your Anthropic API key (`sk-ant-...`)
3. Click **Save Key**

Your key is stored in `localStorage` and sent only to `api.anthropic.com`. It never touches any other server.

---

## Project Structure

```
cocktail-cabinet/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   ├── globals.css        # CSS variables, base styles, animations
    │   └── App.module.css
    ├── hooks/
    │   └── useLocalStorage.js # Persistent state hook
    ├── utils/
    │   └── anthropic.js       # API calls, prompt templates, context builders
    └── components/
        ├── Header.jsx / .module.css    # Navigation
        ├── Cabinet.jsx / .module.css   # Virtual liquor cabinet
        ├── Suggestions.jsx / .module.css  # AI cocktail suggestions
        ├── Reviews.jsx / .module.css   # Tasting notes & ratings
        ├── Recommend.jsx / .module.css # Next bottle recommendations
        └── Settings.jsx / .module.css  # API key & data management
```

---

## How the AI Personalisation Works

The app builds context from two sources before every API call:

**Cabinet context** — the full list of what you have on hand, grouped by category. Suggestions are constrained to ingredients you actually own.

**Taste context** — cocktails you've rated 4–5 stars are passed as "loved", cocktails rated 1–2 are passed as "disliked". The AI uses this to infer flavour preferences (e.g. if you love Negronis and Old Fashioneds, it will lean toward bitter and spirit-forward suggestions).

The more you rate, the better the suggestions get.

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Deploy to any static host — Netlify, Vercel, GitHub Pages, etc.

---

## Tech Stack

- **React 18** — UI
- **Vite 5** — build tooling
- **CSS Modules** — scoped component styles
- **Anthropic API** — `claude-sonnet-4-20250514` for suggestions and recommendations
- **localStorage** — all persistence, no backend required

---

## Contributing

Pull requests welcome. Please open an issue first for anything beyond small bug fixes.

---

## License

MIT
