import Redis from 'ioredis';
import dotenv from 'dotenv';
import { sendEmailNotification } from './sendEmail';

dotenv.config();

const subscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

export const subscribeToMatches = () => {
  subscriber.subscribe('match_channel', (err, count) => {
    if (err) {
      console.error('Failed to subscribe: ', err);
    } else {
      console.log(`Subscribed to ${count} channels.`);
    }
  });

  subscriber.on('message', async (channel, message) => {
    const matchResult = JSON.parse(message);
    await sendEmailNotification(matchResult);
  });
};
