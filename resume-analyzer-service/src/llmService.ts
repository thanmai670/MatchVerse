import Replicate from 'replicate';

// Define types for LLM Response
type PersonalInformation = {
  name: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
};

type LLMResponse = {
  personal_information: PersonalInformation;
  skills: string[];
  education: string[];
  work_experience: string[];
  projects: string[];
  certifications: string[];
  unstructured_text_blocks: string[];
};

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export const extractSectionsUsingLLM = async (chunks: string[]): Promise<LLMResponse> => {
  const chunkLimit = 3000; // Limit the chunk size to avoid LLM truncation
  console.log('Received chunks:', chunks);
  // Initialize the merged response with correct types
  let mergedResponse: LLMResponse = {
    personal_information: { name: '', email: '', phone: '', github: '', linkedin: '' },
    skills: [],
    education: [],
    work_experience: [],
    projects: [],
    certifications: [],
    unstructured_text_blocks: []
  };

  for (const chunk of chunks) {
    if (chunk.length > chunkLimit) continue; // Ignore overly large chunks

    const prompt = `
      You are an expert in extracting information from resumes. Your task is to extract and structure the following sections from the provided resume text. 
      Please strictly follow the format below and return **only the JSON output**. Do not include any explanations or extra text.
      Return the output **only** in this JSON format:
      {
        "personal_information": {
          "name": "John Doe",
          "email": "john.doe@example.com",
          "phone": "+1234567890",
          "github": "github.com/johndoe",
          "linkedin": "linkedin.com/in/johndoe"
        },
        "skills": ["Python", "Machine Learning", "Data Analysis"],
        "education": ["B.Sc in Computer Science from ABC University (2015-2019)"],
        "work_experience": ["Software Engineer at XYZ Corp (2019-2022)"],
        "projects": ["AI Chatbot for Customer Support"],
        "certifications": ["AWS Certified Solutions Architect"],
        "unstructured_text_blocks": ["Other information that doesn't fit into these sections"]
      }
      Here is the resume text to extract the information from:
      ${chunk}
    `;
    try {
      const response: any = await replicate.run("meta/meta-llama-3.1-405b-instruct", { input: { prompt } });
      const joinedResponse = response.join('').trim();
      const jsonMatch = joinedResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('No JSON found in LLM response:', joinedResponse);
        continue;
      }
      const jsonString = jsonMatch[0];
      let parsedResponse: LLMResponse;
      try {
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing LLM response as JSON:', parseError);
        continue; 
      }
      mergedResponse = mergeResponses(mergedResponse, parsedResponse);
    } catch (error) {
      console.error('Error extracting sections from LLM:', error);
    }
  }
  console.log('Final Merged LLM Response:', mergedResponse);
  return mergedResponse;
};

const mergeResponses = (base: LLMResponse, addition: Partial<LLMResponse>): LLMResponse => {
  if (!addition) return base; 
  return {
    personal_information: {
      name: addition.personal_information?.name || base.personal_information.name,
      email: addition.personal_information?.email || base.personal_information.email,
      phone: addition.personal_information?.phone || base.personal_information.phone,
      github: addition.personal_information?.github || base.personal_information.github,
      linkedin: addition.personal_information?.linkedin || base.personal_information.linkedin,
    },
    skills: [...new Set([...(base.skills || []), ...(addition.skills || [])])],
    education: [...new Set([...(base.education || []), ...(addition.education || [])])],
    work_experience: [...new Set([...(base.work_experience || []), ...(addition.work_experience || [])])],
    projects: [...new Set([...(base.projects || []), ...(addition.projects || [])])],
    certifications: [...new Set([...(base.certifications || []), ...(addition.certifications || [])])],
    unstructured_text_blocks: [...new Set([...(base.unstructured_text_blocks || []), ...(addition.unstructured_text_blocks || [])])]
  };
};
