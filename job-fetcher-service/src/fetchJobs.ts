import axios from 'axios';
import dotenv from 'dotenv';
import { publishJob } from './redisClient';
import { JobData } from './shared/messages';
import { v4 as uuidv4 } from 'uuid';
import { encode } from 'punycode';

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
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        datePosted: job.datePosted,
      };

      // Create embeddings for different sections of the job
      const embeddings = await createJobEmbeddings({
        jobId: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
      }, jobData);

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
  };
}


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

export const getLocationId = async (locationName: string): Promise<string | null> => {
  try {
    const keyword = encodeURIComponent(locationName);
    const response = await fetch(`https://linkedin-api8.p.rapidapi.com/search-locations?keyword=${keyword}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY!,
        'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch location id for ${locationName}`);
      return null;
    }

    const data = await response.json();
    // According to the given schema:
    // {
    //   "success": boolean,
    //   "message": string,
    //   "data": {
    //     "items": [
    //       {
    //         "id": string,
    //         "name": string
    //       }
    //     ]
    //   }
    // }
    if (data && data.success && data.data && Array.isArray(data.data.items) && data.data.items.length > 0) {
      // Take the first item's id as locationId
      return data.data.items[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error fetching location id:', error);
    return null;
  }
};



export const getJobDetails = async (id: string) => {
  const jobId = encodeURIComponent(id);
  const url = `https://linkedin-api8.p.rapidapi.com/get-job-details?id=${jobId}`;
  const headers = {
    'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com',
    'x-rapidapi-key': RAPIDAPI_KEY!,
  }
  try {
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    return null;
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
