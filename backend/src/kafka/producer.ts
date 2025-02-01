import { Kafka, Producer } from 'kafkajs';

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || 'websocket-producer',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['192.168.101.11:9092'],
});

export const producer: Producer = kafka.producer();

async function connectProducer() {
    try {
        await producer.connect();
        console.log('Kafka producer connected');
    } catch (error) {
        console.error('Error connecting Kafka producer:', error);
    }
}

connectProducer();