import { publishResumeData } from './redisClient';
import { ResumeData } from './shared/messages';
import { v4 as uuidv4 } from 'uuid';

export const analyzeResume = async (resumeText: string) => {
  // For simplicity, we'll just wrap the text in a ResumeData object
  const resumeData: ResumeData = {
    id: uuidv4(),
    content: resumeText,
  };
  await publishResumeData(resumeData);
};
