"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const availableSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT'];

export default function Home() {
  const [symbol, setSymbol] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [data, setData] = useState<{ [key: string]: { exchange: string, price: number, time: string }[] }>({});
  const [wsMexc, setWsMexc] = useState<WebSocket | null>(null);
  const [wsByBit, setWsByBit] = useState<WebSocket | null>(null);
  const [wsKuCoin, setWsKuCoin] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (wsMexc) {
      wsMexc.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.d && message.d.deals && message.d.deals.length > 0) {
          const price = parseFloat(message.d.deals[0].p);
          const time = new Date(message.d.deals[0].t).toLocaleTimeString();
          setData((prevData) => ({
            ...prevData,
            [message.s]: [...(prevData[message.s] || []), { exchange: 'Mexc', price, time }]
          }));
        }
      };

      wsMexc.onclose = () => {
        console.log('Mexc WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectWebSocket('mexc', symbols), 5000);
      };

      wsMexc.onerror = (error) => {
        console.error('Mexc WebSocket error:', error);
      };
    }
  }, [wsMexc]);

  useEffect(() => {
    if (wsByBit) {
      wsByBit.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.data && message.data.length > 0) {
          const price = parseFloat(message.data[0].p);
          const time = new Date(message.data[0].t).toLocaleTimeString();
          setData((prevData) => ({
            ...prevData,
            [message.data[0].s]: [...(prevData[message.data[0].s] || []), { exchange: 'ByBit', price, time }]
          }));
        }
      };

      wsByBit.onclose = () => {
        console.log('ByBit WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectWebSocket('bybit', symbols), 5000);
      };

      wsByBit.onerror = (error) => {
        console.error('ByBit WebSocket error:', error);
      };
    }
  }, [wsByBit]);

  useEffect(() => {
    if (wsKuCoin) {
      wsKuCoin.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.data && message.data.price && message.data.time) {
          const price = parseFloat(message.data.price);
          const time = new Date(message.data.time).toLocaleTimeString();
          setData((prevData) => ({
            ...prevData,
            [message.data.symbol]: [...(prevData[message.data.symbol] || []), { exchange: 'KuCoin', price, time }]
          }));
        }
      };

      wsKuCoin.onclose = () => {
        console.log('KuCoin WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectWebSocket('kucoin', symbols), 5000);
      };

      wsKuCoin.onerror = (error) => {
        console.error('KuCoin WebSocket error:', error);
      };
    }
  }, [wsKuCoin]);

  const connectWebSocket = (exchange: string, symbols: string[]) => {
    let websocket: WebSocket;
    switch (exchange) {
      case 'mexc':
        websocket = new WebSocket(process.env.NEXT_PUBLIC_MEXC_WEBSOCKET_URL || 'wss://wbs.mexc.com/ws');
        websocket.onopen = () => {
          console.log('Connected to Mexc WebSocket');
          symbols.forEach(symbol => {
            websocket.send(JSON.stringify({ method: 'SUBSCRIPTION', params: [`spot@public.deals.v3.api@${symbol}`] }));
          });
        };
        setWsMexc(websocket);
        break;
      case 'bybit':
        websocket = new WebSocket(process.env.NEXT_PUBLIC_BYBIT_WEBSOCKET_URL || 'wss://stream.bybit.com/v5/public/linear');
        websocket.onopen = () => {
          console.log('Connected to ByBit WebSocket');
          symbols.forEach(symbol => {
            websocket.send(JSON.stringify({ op: 'subscribe', args: [`trade.${symbol}`] }));
          });
        };
        setWsByBit(websocket);
        break;
      case 'kucoin':
        websocket = new WebSocket(process.env.NEXT_PUBLIC_KUCOIN_WEBSOCKET_URL || 'wss://ws-api.kucoin.com/endpoint');
        websocket.onopen = () => {
          console.log('Connected to KuCoin WebSocket');
          symbols.forEach(symbol => {
            websocket.send(JSON.stringify({ id: 1, type: 'subscribe', topic: `/market/ticker:${symbol}` }));
          });
        };
        setWsKuCoin(websocket);
        break;
      default:
        console.error('Unknown exchange:', exchange);
    }
  };

  const handleSubscribe = () => {
    if (symbol && !symbols.includes(symbol)) {
      setSymbols([...symbols, symbol]);
      setSelectedSymbol(symbol);
      connectWebSocket('mexc', [...symbols, symbol]);
      connectWebSocket('bybit', [...symbols, symbol]);
      connectWebSocket('kucoin', [...symbols, symbol]);
      setSymbol('');
    }
  };

  const handleUnsubscribe = (symbolToRemove: string) => {
    setSymbols(symbols.filter(s => s !== symbolToRemove));
    if (selectedSymbol === symbolToRemove) {
      setSelectedSymbol(symbols.length > 1 ? symbols[0] : '');
    }
    // Implement WebSocket unsubscribe logic if needed
  };

  const chartData = {
    labels: data[selectedSymbol]?.map(d => d.time) || [],
    datasets: [
      {
        label: 'Mexc',
        data: data[selectedSymbol]?.filter(d => d.exchange === 'Mexc').map(d => d.price) || [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: 'ByBit',
        data: data[selectedSymbol]?.filter(d => d.exchange === 'ByBit').map(d => d.price) || [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'KuCoin',
        data: data[selectedSymbol]?.filter(d => d.exchange === 'KuCoin').map(d => d.price) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <main className="bg-white shadow-md rounded-lg p-8 max-w-2xl w-full">
        <div className="flex justify-center mb-8">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </div>
        <div className="flex flex-col items-center mb-8">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          >
            <option value="" disabled>Select a symbol</option>
            {availableSymbols.map((sym) => (
              <option key={sym} value={sym}>{sym}</option>
            ))}
          </select>
          <button onClick={handleSubscribe} className="px-4 py-2 bg-blue-500 text-white rounded w-full">
            Subscribe
          </button>
        </div>
        <div className="mt-8 w-full">
          <h2 className="text-lg font-semibold mb-4">Instructions</h2>
          <p className="mb-4">1. Select a symbol from the dropdown and click "Subscribe".</p>
          <p className="mb-4">2. The chart will automatically update to show real-time data for the selected symbol.</p>
          <p className="mb-4">3. You can unsubscribe from a symbol by clicking the "Unsubscribe" button next to it.</p>
          <h2 className="text-lg font-semibold mb-4">Subscribed Symbols</h2>
          <ul className="list-disc list-inside bg-gray-50 p-4 rounded-lg mb-8">
            {symbols.map((symbol, index) => (
              <li key={index} className="mb-2 flex justify-between items-center">
                {symbol}
                <button
                  onClick={() => handleUnsubscribe(symbol)}
                  className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
                >
                  Unsubscribe
                </button>
              </li>
            ))}
          </ul>
          <h2 className="text-lg font-semibold mb-4">Real-Time Data</h2>
          {selectedSymbol ? (
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
              <Line data={chartData} />
            </div>
          ) : (
            <p className="text-center">Please subscribe to a symbol to see the real-time data.</p>
          )}
        </div>
      </main>
    </div>
  );
}