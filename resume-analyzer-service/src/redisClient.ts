import Redis from 'ioredis';
import dotenv from 'dotenv';
import { ResumeData } from './shared/messages';

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

export const publishResumeData = async (resumeData: ResumeData) => {
  if (!redis.status || redis.status !== 'ready') {
    console.error('Redis client is not ready. Current status:', redis.status);
    return;
  }
  console.log('Publishing resume');
  try {
    await redis.publish('resume_channel', JSON.stringify(resumeData));
    console.log('resume published successfully');
  } catch (error) {
    console.error('Error publishing resume:', error);
  }
};