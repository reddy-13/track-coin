import WebSocket from 'ws';
import { producer } from '../kafka';

export const connectToMexc = (symbol: string) => {
    const ws = new WebSocket(process.env.MEXC_WEBSOCKET_URL || 'wss://wbs.mexc.com/ws');

    ws.on('open', () => {
        console.log('Connected to Mexc WebSocket');
        ws.send(JSON.stringify({ method: 'SUBSCRIPTION', params: [`spot@public.deals.v3.api@${symbol}`] }));
    });

    ws.on('message', async (data: string) => {
        const message = JSON.parse(data);
        console.log(`Received data from Mexc: ${data}`);

        // Handle PONG response
        if (message.msg === 'PONG') {
            console.log('Received PONG from Mexc');
            return;
        }

        // Handle subscription response
        if (message.method === 'SUBSCRIPTION' && message.code === 0) {
            console.log(`Subscribed to ${message.msg}`);
            return;
        }

        // Handle unsubscription response
        if (message.method === 'UNSUBSCRIPTION' && message.code === 0) {
            console.log(`Unsubscribed from ${message.msg}`);
            return;
        }

        // Send data to Kafka producer
        await producer.send({
            topic: 'trading-data',
            messages: [{ value: data }],
        });
    });

    ws.on('close', () => {
        console.log('Mexc WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectToMexc(symbol), 5000);
    });

    ws.on('error', (error) => {
        console.error('Mexc WebSocket error:', error);
    });

    // Send PING to maintain the connection
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ method: 'PING' }));
        }
    }, 30000); // Send PING every 30 seconds

    ws.on('close', () => {
        clearInterval(pingInterval);
    });
};