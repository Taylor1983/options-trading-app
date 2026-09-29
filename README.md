# Options Trading App

A monorepo starter for a Thinkorswim-style options trading platform.

## Included

- React + TypeScript dashboard for the trading experience
- Express API for quotes, options chain, and portfolio endpoints
- Shared TypeScript package for app-wide contracts
- PostgreSQL + Redis-ready configuration for future wiring
- WebSocket-ready backend foundation for real-time market updates

## Workspaces

- apps/web: trading UI
- apps/api: market data and order API
- packages/shared: shared types

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```
3. Open the frontend:
   - http://localhost:3000
4. API runs on:
   - http://localhost:4000

## Environment

Copy `apps/api/.env.example` to `apps/api/.env` and set the values.

## Notes

This is a starter MVP intended for rapid iteration. The backend includes mock quote and chain data so the app works immediately before you connect broker or market data providers.
