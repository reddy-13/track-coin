import WebSocket from 'ws';
import { producer } from '../kafka';

export const connectToBybit = (symbol: string) => {
    const ws = new WebSocket(process.env.BYBIT_WEBSOCKET_URL || 'wss://stream.bybit.com/v5/public/linear');

    ws.on('open', () => {
        console.log('Connected to Bybit WebSocket');
        ws.send(JSON.stringify({ op: 'subscribe', args: [`trade.${symbol}`] }));
    });

    ws.on('message', async (data: string) => {
        console.log(`Received data from Bybit: ${data}`);
        await producer.send({
            topic: 'trading-data',
            messages: [{ value: data }],
        });
    });

    ws.on('close', () => {
        console.log('Bybit WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectToBybit(symbol), 5000);
    });

    ws.on('error', (err: Error) => {
        console.error(`Bybit WebSocket error: ${err.message}`);
    });
};