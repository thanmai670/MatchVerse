import Redis from 'ioredis';
import dotenv from 'dotenv';
import { ResumeData } from './shared/messages';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

export const publishResumeData = async (resumeData: ResumeData) => {
  try {
    await redis.publish('resume_channel', JSON.stringify(resumeData));
    // console.log('Published extracted resume:', resumeData);
  } catch (error) {
    console.error('Error publishing resume:', error);
  }
};
