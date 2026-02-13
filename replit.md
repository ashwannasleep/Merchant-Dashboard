# MerchantIQ - Amazon Inventory Dashboard

## Overview
High-performance Amazon merchant inventory dashboard built with Express + Vite + React + TypeScript. Features virtualized table rendering for 10,000+ products, thundering herd conflict resolution simulation, sales velocity prediction, and Chart.js analytics.

## Architecture
- **Frontend**: React 18 + TypeScript, Wouter routing, TanStack Query, react-window (virtualization), Chart.js/react-chartjs-2, Tailwind CSS + Shadcn UI
- **Backend**: Express.js with in-memory storage for 10,000+ mock products
- **Theme**: Warm Paper (amber/brown tones matching Memoria project)
- **Design**: Sidebar navigation with dark mode toggle

## Key Features
1. **Virtualized Inventory Table** - react-window renders 10,000+ rows at 60fps with filtering/sorting
2. **Thundering Herd Simulation** - Mock AWS Lambda API with conflict resolution (last-write-wins, highest-stock, average strategies)
3. **Sales Velocity Predictor** - Calculates days of stock left, highlights OOS risks in red
4. **Chart.js Analytics** - Revenue trends, sales/orders bar charts, category/status doughnut charts

## Pages
- `/` - Dashboard (overview stats, charts, stock alerts)
- `/inventory` - Virtualized inventory table
- `/analytics` - Full analytics with KPIs and Chart.js charts
- `/velocity` - Sales velocity predictor with risk assessment
- `/conflicts` - Thundering herd conflict monitor with simulation

## API Routes
- `GET /api/products` - All products (10,000+)
- `GET /api/products/:id` - Single product
- `GET /api/stats` - Dashboard statistics
- `GET /api/sales` - 30-day sales data
- `GET /api/herd-events` - Thundering herd events
- `POST /api/stock-update` - Update stock with conflict detection
- `POST /api/simulate-herd` - Simulate thundering herd event

## Running
- `npm run dev` starts Express + Vite on port 5000
