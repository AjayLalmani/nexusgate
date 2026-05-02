# NexusGate API Gateway Platform

NexusGate is a complete full-stack API Gateway SaaS platform with rate limiting, analytics, API key management, and proxy routing.

## Features
- **API Proxy**: Forward requests securely using Axios.
- **Rate Limiting**: Sliding window rate limiting powered by Redis.
- **Analytics**: Async request logging and usage tracking.
- **Authentication**: JWT-based auth with refresh token rotation.
- **Billing**: Dummy Stripe integration for Free, Pro, and Enterprise tiers.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Redis (ioredis)
- **Frontend**: React (Vite), TailwindCSS, Recharts, Zustand

## Setup & Run Locally

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### 2. Infrastructure (MongoDB & Redis)
At the root of the project:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.
The backend API runs on `http://localhost:5000`.

## Testing Gateway Forwarding
1. Sign up and login via the frontend.
2. Create an API (e.g., Target: `https://jsonplaceholder.typicode.com`).
3. Generate an API Key.
4. Send a request to the gateway:
```bash
curl -H "x-api-key: your_api_key_here" http://localhost:5000/gateway/todos/1
```
