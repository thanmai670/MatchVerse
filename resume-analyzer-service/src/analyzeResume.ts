import { publishResumeData } from './redisClient';
import { extractSectionsUsingLLM } from './llmService';
import { ResumeData } from './shared/messages';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const analyzeResume = async (resumeText: string) => {

  const preprocessedSections = extractSectionsWithRegex(resumeText);

  const llmSections = await extractSectionsUsingLLM(preprocessedSections.unstructured_text_blocks);
  
  const mergedSections = {
    ...preprocessedSections,
    ...llmSections
  };


  const resumeData: ResumeData = {
    id: uuidv4(),
    personal_information: mergedSections.personal_information || {
      name: '',
      email: '',
      phone: '',
      github: '',
      linkedin: ''
    },
    skills: mergedSections.skills || [],
    education: mergedSections.education || [],
    work_experience: mergedSections.work_experience || [],
    projects: mergedSections.projects || [],
    certifications: mergedSections.certifications || []
  };

  await generateEmbeddingsForSections(resumeData);``
  await publishResumeData(resumeData);
  return resumeData;
};

const extractSectionsWithRegex = (text: string) => {
  const personalInfoRegex = {
    name: /(?:^|\n)([A-Za-z][A-Za-z .'-]{2,}),? *(?:\n|$)/, 
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
    phone: /(?:\+?\d{1,4}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    github: /github\.com\/[A-Za-z0-9_-]+/,
    linkedin: /linkedin\.com\/in\/[A-Za-z0-9_-]+/
  };

  const personalInformation = {
    name: text.match(personalInfoRegex.name)?.[1] || '',
    email: text.match(personalInfoRegex.email)?.[0] || '',
    phone: text.match(personalInfoRegex.phone)?.[0] || '',
    github: text.match(personalInfoRegex.github)?.[0] || '',
    linkedin: text.match(personalInfoRegex.linkedin)?.[0] || ''
  };


  const skillsRegex = /(?:Skills|Technical Skills|Key Skills)[\s\S]*?:\s*([\s\S]*?)(?:\n\n|$)/i;
  const educationRegex = /(?:Education|Academic Background|Degrees)[\s\S]*?:\s*([\s\S]*?)(?:\n\n|$)/i;
  const workExperienceRegex = /(?:Experience|Work Experience)[\s\S]*?:\s*([\s\S]*?)(?:\n\n|$)/i;
  const projectsRegex = /(?:Projects|Notable Projects)[\s\S]*?:\s*([\s\S]*?)(?:\n\n|$)/i;
  const certificationsRegex = /(?:Certifications|Licenses)[\s\S]*?:\s*([\s\S]*?)(?:\n\n|$)/i;

  const skills = (text.match(skillsRegex)?.[1] || '').split(/,|\n/).map(skill => skill.trim()).filter(Boolean);
  const education = (text.match(educationRegex)?.[1] || '').split(/\n/).map(edu => edu.trim()).filter(Boolean);
  const work_experience = (text.match(workExperienceRegex)?.[1] || '').split(/\n/).map(exp => exp.trim()).filter(Boolean);
  const projects = (text.match(projectsRegex)?.[1] || '').split(/\n/).map(proj => proj.trim()).filter(Boolean);
  const certifications = (text.match(certificationsRegex)?.[1] || '').split(/\n/).map(cert => cert.trim()).filter(Boolean);


  const chunks = text.split(/\n{2,}/g); 

  const unstructured_text_blocks = chunks.filter(chunk => {
   
    return !Object.values(personalInformation).some(info => chunk.includes(info));
  });

  return {
    personal_information: personalInformation,
    skills,
    education,
    work_experience,
    projects,
    certifications,
    unstructured_text_blocks
  };
};


const generateEmbeddingsForSections = async (resumeData: ResumeData) => {
  const sections = {
    skills: resumeData.skills.join(' '),
    education: resumeData.education.join(' '),
    work_experience: resumeData.work_experience.join(' '),
    projects: resumeData.projects.join(' '),
    certifications: resumeData.certifications.join(' ')
  };

  
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
};

