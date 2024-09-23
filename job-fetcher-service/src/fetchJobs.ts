import axios from 'axios';
import dotenv from 'dotenv';
import { publishJob } from './redisClient';
import { JobData } from './shared/messages';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export const fetchJobs = async () => {
  const url = 'https://linkedin-api8.p.rapidapi.com/search-jobs-v2';
  const params = {
    keywords: 'Fullstack developer',
    locationId: '101282230',
    datePosted: 'past24Hours',
    sort: 'mostRecent',
  };
  const headers = {
    'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY!,
  };

  try {
    const response = await axios.get(url, { headers, params });
    const jobs = response.data?.data || [];
    console.log(`Fetched ${jobs.length} jobs`);
    for (const job of jobs) {
      const jobData: JobData = {
        id: uuidv4(),
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        datePosted: job.datePosted,
      };
      console.log('Job data prepared');
      await publishJob(jobData);
    }
  } catch (error) {
    console.error('Error fetching or publishing jobs:', error);
  }
};

export const scheduleJobFetching = () => {
  // Fetch jobs immediately and then every hour
  fetchJobs();
  setInterval(fetchJobs, 3600000);
};
