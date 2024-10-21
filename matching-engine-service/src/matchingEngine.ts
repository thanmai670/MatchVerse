import { Ollama } from 'ollama';
import dotenv from 'dotenv';
import { MatchResult, JobData, ResumeData } from './shared/messages';
import { publishMatchResult } from './redisClient';
import Replicate from "replicate";

dotenv.config();

// set REPLICATE_API_TOKEN as my environment variable

// const ollama = new Ollama({
//   host: process.env.OLLAMA_BASE_URL || 'http://ollama-service:11434',
// });

const replicate = new Replicate({
  auth: '',
});

export const matchJobAndResume = async (jobData: JobData, resumeData: ResumeData) => {
  console.log('Matching job and resume preparing prompt');
  const prompt = `
    Analyze how well the following resume matches the job description. Provide a relevance score out of 10 and explain the reasoning.

    Resume:
    ${resumeData.content}

    Job Description:
    ${jobData.description}

    Provide the score and reasoning in JSON format like {"score": 0, "reasoning": "..."}.
  `;

  const input = {
    prompt: prompt,
    max_tokens: 1024,
  };

  const output = await replicate.run("meta/meta-llama-3.1-405b-instruct", { input });
  console.log('output', output);
  await publishMatchResult(output);
};
