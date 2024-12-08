import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

export const extractSectionsUsingLLM = async (chunks: string[]) => {
  const chunkLimit = 500; 
  let responseData = {
    work_experience: [] as any[],
    projects: [] as any[],
    certifications: [] as any[]
  };

  for (const chunk of chunks) {
    if (chunk.length > chunkLimit) continue; // Ignore large chunks

    const prompt = `
      Extract the following sections from the given chunk:
      1. **Work Experience** - Job roles, companies, and durations.
      2. **Projects** - Side projects or academic projects.
      3. **Certifications** - Certifications achieved.
      
      Return response in JSON like:
      {
        "work_experience": [],
        "projects": [],
        "certifications": []
      }

      Text:
      ${chunk}
    `;

    try {
      const response = await replicate.run("meta/meta-llama-3.1-405b-instruct", { input: { prompt } });
      console.log(response)
      if (response && typeof response === 'object' && 'output' in response) {
        const output = response.output as any;
        if (Array.isArray(output.work_experience)) {
          responseData.work_experience.push(...output.work_experience);
        }
        if (Array.isArray(output.projects)) {
          responseData.projects.push(...output.projects);
        }
        if (Array.isArray(output.certifications)) {
          responseData.certifications.push(...output.certifications);
        }
      }
    } catch (error) {
      console.error('Error extracting sections from LLM:', error);
    }
  }

  return responseData;
};