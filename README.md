# Real-Time Data Dashboard

This project is a real-time data dashboard that displays live data from multiple cryptocurrency exchanges. The frontend is built with Next.js and Tailwind CSS, while the backend uses Express.js and Kafka for handling WebSocket connections and data streaming.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (v20.10.0 or higher)
- npm (v10.2.3 or higher)
- Docker (for running Kafka locally)

## Getting Started
1. **Clone the Repository**:

```bash
git clone https://github.com/reddy-13/track-coin.git
cd track-coin```

### 2. Set Up Environment Variables
Create a `.env` file in the `backend` directory with the following content:

PORT=3001
KAFKA_BROKER=localhost:9092
KUCOIN_WEBSOCKET_URL=wss://ws-api.kucoin.com/endpoint
BYBIT_WEBSOCKET_URL=wss://stream.bybit.com/v5/public/linear
MEXC_WEBSOCKET_URL=wss://wbs.mexc.com/ws

Create a `.env.local` file in the `frontend` directory with the following content:

NEXT_PUBLIC_MEXC_WEBSOCKET_URL=wss://wbs.mexc.com/ws
NEXT_PUBLIC_BYBIT_WEBSOCKET_URL=wss://stream.bybit.com/v5/public/linear
NEXT_PUBLIC_KUCOIN_WEBSOCKET_URL=wss://ws-api.kucoin.com/endpoint

### 3. Install Dependencies
Navigate to the `backend` and `frontend` directories and install the dependencies:

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

### 4. Run Kafka Locally with Docker
Navigate to the `docker` directory and run the Docker containers in detachable mode:

cd docker
docker-compose up -d

### 5. Start the Backend Server
Navigate to the `backend` directory and start the server:

cd ../backend
npm start

### 6. Start the Frontend Server
Navigate to the `frontend` directory and start the development server:

cd ../frontend
npm run dev


The frontend server will start on port 3000.

Usage
Open your browser and navigate to http://localhost:3000.
Select a symbol from the dropdown and click "Subscribe".
The chart will automatically update to show real-time data for the selected symbol.
You can unsubscribe from a symbol by clicking the "Unsubscribe" button next to it.
### Project Structure
Project Structure

realtime-data-dashboard/
├── backend/
│   ├── src/
│   │   ├── kafka/
│   │   │   └── index.ts
│   │   ├── websocket/
│   │   │   ├── bybit.ts
│   │   │   ├── kucoin.ts
│   │   │   ├── mexc.ts
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── pages/
│   │   └── index.tsx
│   ├── public/
│   ├── styles/
│   │   └── globals.css
│   ├── .env.local
│   ├── package.json
│   └── tsconfig.json
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile
├── .gitignore
└── README.md
```
## Assumptions Made During Development

This section outlines some key assumptions made during the development of this real-time data dashboard:

**Initial Development Challenges:**

* **Single Docker Container:** Initially, a single Docker container was used to house all application components (backend, frontend, Kafka, Zookeeper). This approach proved to be cumbersome for managing and debugging individual parts. The current architecture separates these components into distinct containers for better maintainability and scalability.
* **Single-Page Application (SPA) Approach:** The initial plan was to build the entire application as a full-fledged SPA using Next.js. However, this approach presented limitations for handling real-time data streaming and WebSocket connections. The current setup with a separate backend using Express.js offers a more suitable solution for these functionalities.
* **Static Currency List:** The initial implementation included a fixed list of currencies. This has been improved to allow users to dynamically subscribe to specific symbols, providing greater flexibility and user control.

**Current Limitations:**

* **Mexc API Integration:** While the WebSocket connection to Mexc is established, the logic for retrieving and processing data from the Mexc API might still require further development.
* **Kucoin Integration:** The Kucoin WebSocket connection is functional, but the frontend might not be fully displaying the received data yet. Additional work might be needed to integrate the data into the user interface.
* **Bybit API Access:** The provided Bybit WebSocket URL might not be accessible or require further configuration for successful data retrieval.

These assumptions provide transparency into the development process and highlight areas for potential improvement.



