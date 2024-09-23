import Redis from 'ioredis';
import dotenv from 'dotenv';
import { JobData, ResumeData } from './shared/messages';
import { matchJobAndResume } from './matchingEngine';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

const subscriber = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

let jobs: JobData[] = [];
let resumes: ResumeData[] = [];

export const subscribeToChannels = () => {
  subscriber.subscribe('job_channel', 'resume_channel', (err, count) => {
    if (err) {
      console.error('Failed to subscribe: ', err);
    } else {
      console.log(`Subscribed to ${count} channels.`);
    }
  });

  subscriber.on('message', async (channel, message) => {
    try {
      if (channel === 'job_channel') {
        const jobData = JSON.parse(message) as JobData;
        jobs.push(jobData);
        console.log(`Received job. Total jobs: ${jobs.length}`);
        await processMatches();
      } else if (channel === 'resume_channel') {
        const resumeData = JSON.parse(message) as ResumeData;
        resumes.push(resumeData);
        console.log(`Received resume. Total resumes: ${resumes.length}`);
        await processMatches();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
};

const processMatches = async () => {
  if (jobs.length === 0 || resumes.length === 0) {
    console.log('Waiting for both jobs and resumes to be available.');
    return;
  }

  console.log('Both jobs and resumes are available. Starting matching process.');

  for (const job of jobs) {
    for (const resume of resumes) {
      console.log(`Matching job ${job.id} and resume ${resume.id}`);
      await matchJobAndResume(job, resume);
    }
  }

  // Clear arrays after processing
  jobs = [];
  resumes = [];
  console.log('Matching process completed. Cleared jobs and resumes.');
};

export const publishMatchResult = async (matchResult: any) => {
  try {
    await redis.publish('match_channel', JSON.stringify(matchResult));
    console.log('Published match result:', matchResult);
  } catch (error) {
    console.error('Error publishing match result:', error);
  }
};