# 📈 Pulse — Smart Market Watchlist & Intelligence Dashboard

**Pulse** is a full-stack real-time market watchlist application designed to help traders and investors cut through the noise. It features an intelligent **Attention Engine** that highlights significant market moves, volume anomalies, technical indicator breaks, and custom alert breaches, alongside a **Snapshot ("Since Last Seen")** system that tracks price movements between user visits.

---

## 🏗️ Architecture & Tech Stack

### **Frontend**
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `clsx`, `date-fns`

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/) + [TypeScript](https://www.typescriptlang.org/) / [tsx](https://github.com/privatenumber/tsx)
- **Database**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) (Embedded SQLite with WAL mode)
- **Utilities**: `dotenv`, `cors`, `uuid`

---

## ✨ Key Features

### 1. 🎯 Dynamic Attention Engine
Pulse analyzes stocks in your watchlist and assigns an **Attention Score (0–100)** to prioritize what needs your immediate review:
- **Price Velocity (30%)**: Compares intraday movement against the stock's 14-day Average True Range (ATR).
- **Volume Anomaly (25%)**: Flags spikes exceeding 20-day average trading volume.
- **Threshold Breaches (20%)**: Triggers when custom user-defined price alerts (`above` / `below`) are crossed.
- **Trend Breaks (15%)**: Identifies price crossovers across the 20-day Simple Moving Average (SMA-20).
- **Momentum Shifts (10%)**: Flags overbought (RSI > 70) or oversold (RSI < 30) conditions.

### 2. 🕒 "Changes Since Last Seen" Snapshot
- Stores user-specific snapshots of stock prices when you mark them as seen or leave the dashboard.
- Highlights cumulative delta and percentage changes since your last session.

### 3. 📋 Multi-Watchlist Management
- Create, rename, delete, and switch between multiple custom watchlists.
- Add/remove stocks with quick search capability.
- Attach private notes and custom high/low alert triggers per stock.

### 4. 🔄 Real-Time Market Simulation
- Background polling refreshes market quotes every 15 seconds.
- Auto-generates realistic simulated historical prices, daily OHLCV data, and technical indicators.

### 5. 💾 Import & Export
- Backup and restore full watchlists and stock configurations via JSON export/import endpoints.

---

## 📁 Project Structure

```text
Groww/
├── both/
│   ├── backend/
│   │   ├── data/                 # SQLite database storage (pulse.db)
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── database.ts   # SQLite connection and configuration
│   │   │   │   └── schema.ts     # Table schemas (users, watchlists, quotes, history)
│   │   │   ├── routes/
│   │   │   │   ├── watchlist.routes.ts  # Watchlist CRUD endpoints
│   │   │   │   ├── market.routes.ts     # Search, quotes, and pulse feed
│   │   │   │   └── export.routes.ts     # JSON import/export endpoints
│   │   │   ├── services/
│   │   │   │   ├── attention.service.ts   # Attention score calculation engine
│   │   │   │   ├── indicators.service.ts  # Technical indicators (SMA, RSI, ATR)
│   │   │   │   ├── market-data.service.ts # Real-time quote feed & simulation
│   │   │   │   └── snapshot.service.ts    # User session price delta snapshots
│   │   │   └── server.ts         # Express application entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── AddStockDialog.tsx    # Modal to search and add stocks
│       │   │   ├── AttentionBadge.tsx    # Visual attention severity tag
│       │   │   ├── EditItemDialog.tsx    # Modal to update price alerts & notes
│       │   │   ├── MarketStatusBar.tsx   # Top status bar with refresh controls
│       │   │   ├── PulseDashboard.tsx    # Main dashboard view
│       │   │   ├── StockCard.tsx         # Detailed stock display card
│       │   │   └── WatchlistManager.tsx  # Watchlist selector and manager
│       │   ├── hooks/
│       │   │   ├── usePolling.ts         # Polling hook for background sync
│       │   │   ├── usePulse.ts           # Hook for fetching dashboard data
│       │   │   └── useUser.ts            # Anonymous user session identifier
│       │   ├── lib/
│       │   │   ├── api.ts                # Frontend API client
│       │   │   └── market-utils.ts       # Formatting and market calculations
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── types.ts                  # TypeScript interfaces
│       ├── package.json
│       ├── tailwind.config.js
│       └── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [npm](https://www.npmjs.com/) (version 9+ recommended)

---

### 1. Installation

Install dependencies in both `backend` and `frontend`:

```bash
# Navigate to backend and install packages
cd both/backend
npm install

# Navigate to frontend and install packages
cd ../frontend
npm install
```

---

### 2. Running in Development Mode

Run the backend and frontend in separate terminal windows:

#### **Terminal 1: Start Backend**
```bash
cd both/backend
npm run dev
```
> The backend server will start on [http://localhost:3001](http://localhost:3001).

#### **Terminal 2: Start Frontend**
```bash
cd both/frontend
npm run dev
```
> The Vite development server will start on [http://localhost:5173](http://localhost:5173).

---

### 3. Production Build

```bash
# Build Backend
cd both/backend
npm run build
npm start

# Build Frontend
cd both/frontend
npm run build
npm run preview
```

---

## 🔌 API Reference

### **Watchlists**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Initialize or load an existing user profile |
| `GET` | `/api/watchlists?userId={id}` | List all watchlists for a user |
| `POST` | `/api/watchlists` | Create a new watchlist |
| `DELETE` | `/api/watchlists/:id` | Delete a watchlist |
| `GET` | `/api/watchlists/:id/items` | Get all items in a watchlist |
| `POST` | `/api/watchlists/:id/items` | Add a stock symbol to a watchlist |
| `PATCH` | `/api/watchlists/:id/items/:symbol` | Update alert prices or notes |
| `DELETE` | `/api/watchlists/:id/items/:symbol` | Remove a symbol from a watchlist |

### **Market Data & Pulse**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?q={query}` | Search available stock symbols |
| `GET` | `/api/quotes?symbols={s1,s2}` | Get current quotes for symbols |
| `GET` | `/api/pulse/:userId` | Get full dashboard view with computed attention scores |
| `POST` | `/api/pulse/:userId/seen` | Capture snapshot of current prices as "last seen" |

### **Data Portability**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/export/:userId` | Export user watchlists and items as JSON |
| `POST` | `/api/import/:userId` | Import watchlists from JSON payload |

---

## ⚙️ Configuration & Environment

- **Backend Port**: Configurable via `PORT` in `.env` (defaults to `3001`).
- **Frontend Proxy**: Configured in `vite.config.ts` to automatically route `/api/*` calls to `http://localhost:3001`.
