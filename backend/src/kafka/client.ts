import { Kafka} from 'kafkajs';

const kafka = new Kafka({
    clientId: 'websocket-consumer',
    brokers: ['localhost:9092'],
})

export default kafka;