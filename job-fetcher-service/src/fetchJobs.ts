import axios from 'axios';
import dotenv from 'dotenv';
import { publishJob } from './redisClient';
import { JobData } from './shared/messages';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL;  // Embedding API endpoint

export const fetchJobs = async (params: {
  keywords: string;
  locationId: string;
  datePosted: string;
  sort: string;
}) => {
  const url = 'https://linkedin-api8.p.rapidapi.com/search-jobs-v2';
  const headers = {
    'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY!,
  };

  try {
    const response = await axios.get(url, { headers, params });
    const jobs = response.data?.data || [];
    console.log('Fetched jobs:', jobs);
    for (const job of jobs) {
      const jobData: JobData = {
        id: uuidv4(),
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        datePosted: job.datePosted,
      };

      // Create embeddings for different sections of the job
      const embeddings = await createJobEmbeddings({
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
      },jobData);

      // Include embeddings in the jobData to be published
      const jobWithEmbeddings = {
        ...jobData,
        embeddings,
      };

      await publishJob(jobWithEmbeddings);
    }
  } catch (error) {
    console.error('Error fetching or publishing jobs:', error);
  }
};


export const fetchJobDetails = async (jobId: string) => {
  const url = `https://linkedin-api8.p.rapidapi.com/job-details/${jobId}`;
  const headers = {
    'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY!,
  };}


const createJobEmbeddings = async (sections: Record<string, string>, metadata: Record<string, any>) => {
  try {
    const response = await axios.post(`http://embedding-api-service:5500/api/embed`, {
      entity_type: 'job',  // Include entity_type for job
      sections,
      metadata  
    });

    return response.data.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return {};
  }
};


// export const scheduleJobFetching = () => {
//   fetchJobs({
//     keywords: 'Fullstack developer',
//     locationId: '101282230',
//     datePosted: 'past24Hours',
//     sort: 'mostRecent',
//   });
//   setInterval(fetchJobs, 3600000);
// };
