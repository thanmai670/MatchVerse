export interface JobData {
    id: string;
    jobId: string;
    title: string;
    company: string;
    location: string;
    description: string;
    datePosted: string;
  }
  
  export interface ResumeData {
    id: string;
    personal_information: {
      name: string;
      email: string;
      phone: string;
      github: string;
      linkedin: string;
    };
    skills: string[];
    education: string[];
    work_experience: string[];
    projects: string[];
    certifications: string[];
    unstructured_text_blocks: string[];
  }
  
  export interface MatchResult {
    jobId: string;
    resumeId: string;
    score: number;
    reasoning: string;
  }
  