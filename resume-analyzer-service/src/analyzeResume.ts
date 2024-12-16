import { publishResumeData } from './redisClient';
import { extractSectionsUsingLLM } from './llmService';
import { ResumeData } from './shared/messages';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const analyzeResume = async (resumeText: string) => {
  // Step 1: Extract sections using the LLM only (No regex)
  const CHUNK_SIZE = 3000;
  const chunks = resumeText.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'g')) || [resumeText];
  const llmSections = await extractSectionsUsingLLM(chunks);
  
  const resumeData: ResumeData = {
    id: uuidv4(),
    personal_information: llmSections.personal_information || {
      name: '',
      email: '',
      phone: '',
      github: '',
      linkedin: ''
    },
    skills: llmSections.skills || [],
    education: llmSections.education || [],
    work_experience: llmSections.work_experience || [],
    projects: llmSections.projects || [],
    certifications: llmSections.certifications || [],
    unstructured_text_blocks: llmSections.unstructured_text_blocks || []
  };

  

  await generateEmbeddingsForSections(resumeData);
  await publishResumeData(resumeData);
  
  return resumeData;
};

const generateEmbeddingsForSections = async (resumeData: ResumeData) => {
  const sections = {
    skills: resumeData.skills.join(' '),
    education: resumeData.education.join(' '),
    work_experience: resumeData.work_experience.join(' '),
    projects: resumeData.projects.join(' '),
    certifications: resumeData.certifications.join(' '),
    unstructured_text_blocks: resumeData.unstructured_text_blocks.join(' ')
  };

  console.log('Sections for Embedding:', sections);

  try {
    const response = await axios.post(`http://embedding-api-service:5500/api/embed`, {
      entity_type: 'resume',
      sections: sections,
      metadata: {
        resume_id: resumeData.id,
        name: resumeData.personal_information.name,
        email: resumeData.personal_information.email,
        phone: resumeData.personal_information.phone,
        github: resumeData.personal_information.github,
        linkedin: resumeData.personal_information.linkedin
      }
    });
    return response.data.embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return {};
  }
};
