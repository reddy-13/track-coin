import WebSocket from 'ws';
import axios from 'axios';
import { producer } from '../kafka';

const getKuCoinToken = async () => {
    try {
        const response = await axios.post('https://api.kucoin.com/api/v1/bullet-public');
        const { token, instanceServers } = response.data.data;
        return { token, instanceServers };
    } catch (error) {
        console.error('Error fetching KuCoin token:', error);
        throw error;
    }
};

export const connectToKuCoin = async (symbol: string) => {
    const { token, instanceServers } = await getKuCoinToken();
    const wsUrl = `${instanceServers[0].endpoint}?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
        console.log('Connected to KuCoin WebSocket');
        ws.send(JSON.stringify({ id: 1, type: 'subscribe', topic: `/market/ticker:${symbol}` }));
    });

    ws.on('message', async (data: string) => {
        const message = JSON.parse(data);
        console.log(`Received data from KuCoin: ${data}`);

        // Handle welcome message
        if (message.type === 'welcome') {
            console.log('Received welcome message from KuCoin');
            return;
        }

        // Handle error message
        if (message.type === 'error') {
            console.error(`Error from KuCoin: ${message.data}`);
            return;
        }

        // Send data to Kafka producer
        await producer.send({
            topic: 'trading-data',
            messages: [{ value: data }],
        });
    });

    ws.on('close', () => {
        console.log('KuCoin WebSocket disconnected. Reconnecting...');
        setTimeout(() => connectToKuCoin(symbol), 5000);
    });

    ws.on('error', (error) => {
        console.error('KuCoin WebSocket error:', error);
    });
};