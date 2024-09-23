export interface JobData {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    datePosted: string;
  }
  
  export interface ResumeData {
    id: string;
    content: string;
  }
  
  export interface MatchResult {
    jobId: string;
    resumeId: string;
    score: number;
    reasoning: string;
  }
  