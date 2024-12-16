import axios from 'axios';
import dotenv from 'dotenv';
import { JobData, MatchResult, ResumeData } from './shared/messages';
import { publishMatchResult } from './redisClient';
import Replicate from 'replicate';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Vector Store Base URL
const VECTOR_STORE_URL = process.env.VECTOR_STORE_URL || 'http://vector_store:5200';

// Initialize Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export const matchJobAndResume = async (jobData: JobData, resumeData: ResumeData) => {
  console.log('Matching job and resume started.');

  // Generate unique IDs if not already present
  const jobId = jobData.id || uuidv4();
  const resumeId = resumeData.id || uuidv4();

  try {
      // Use jobId and resumeId consistently throughout the process
      console.log(`Processing Job ID: ${jobId}, Resume ID: ${resumeId}`);

      // Vector search (e.g., weighted search)
    //   const weightedResponse = await axios.post(`${VECTOR_STORE_URL}/resume/weighted_search`, {
    //       job_embedding: jobData.embeddings,
    //       resume_embeddings: resumeData.embeddings,
    //       weights: {
    //           skills: 0.7,
    //           experience: 0.2,
    //           education: 0.1,
    //       },
    //   });
    //   const weightedScore = weightedResponse.data.weighted_score;

      // Task-based search
    //   const taskBasedResponse = await axios.post(`${VECTOR_STORE_URL}/resume/task_based_search`, {
    //       job_tasks: jobData.embeddings,
    //       resume_embeddings: resumeData.embeddings,
    //   });
    //   const taskSearchResults = taskBasedResponse.data.task_search_results;

      // Prepare the prompt for Replicate
    //   const prompt = `
    //       Analyze the following job-resume matching results and provide a final relevance score out of 10 and detailed reasoning.

    //       Vector Search Results:
    //       ${JSON.stringify({ weightedScore, taskSearchResults }, null, 2)}

    //       Job Details:
    //       ${JSON.stringify(jobData, null, 2)}

    //       Resume Details:
    //       ${JSON.stringify(resumeData, null, 2)}

    //       Provide the score and reasoning in JSON format like {"score": 0, "reasoning": "..."}.
    //   `;

    //   const replicateOutput = await replicate.run('meta/meta-llama-3.1-405b-instruct', {
    //       input: { prompt, max_tokens: 1024 },
    //   });

      // // Final match result
      // const matchResult: MatchResult = {
      //     jobId,
      //     resumeId,
      //     score: 1,
      //     reasoning: "reasoning",
      // };

    //   console.log('Final match result:', replicateOutput);

      // Publish the result to Redis
    //   await publishMatchResult(replicateOutput);

  } catch (error:any) {
      console.error('Error matching job and resume:', error.response ? error.response.data : error.message);
  }
};
