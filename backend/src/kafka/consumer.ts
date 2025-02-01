import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'realtime-data',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'realtime-data-group' });

export const startConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'trading-data', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        value: message.value?.toString(),
      });
    },
  });
};

export const producer = kafka.producer();