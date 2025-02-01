import express, { Request, Response } from 'express';
import type { Application } from 'express';
import dotenv from 'dotenv';
import { startWebSocketConnections } from './websocket';
import { startConsumer } from './kafka';
import { KafkaJSError } from 'kafkajs';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.post('/api/symbols', async (req: Request, res: Response): Promise<any> =>{ 
  try {
    const { symbols } = await req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ error: 'Invalid symbols: Please provide an array of symbols.' }); 
    }

    symbols.forEach(symbol => startWebSocketConnections(symbol));

    return res.status(200).json({ message: 'WebSocket connections started successfully.' });

  } catch (error) {
    console.error('Error processing symbols:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Kafka consumer
startConsumer().catch(error => {
  if (error instanceof KafkaJSError && error.message.includes('The producer is disconnected')) {
    throw new KafkaJSError('The producer is disconnected');
  } else {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});