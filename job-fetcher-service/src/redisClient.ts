import Redis from 'ioredis';
import dotenv from 'dotenv';
import { JobData } from './shared/messages';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

export const publishJob = async (jobData: JobData) => {
  if (!redis.status || redis.status !== 'ready') {
    console.error('Redis client is not ready. Current status:', redis.status);
    return;
  }
  console.log('Publishing job');
  try {
    await redis.publish('job_channel', JSON.stringify(jobData));
    console.log('Job published successfully');
  } catch (error) {
    console.error('Error publishing job:', error);
  }
};