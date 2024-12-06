export interface JobData {
  id: string; // UUID v4 string, e.g., '123e4567-e89b-12d3-a456-426614174000'
  title: string;
  company: string;
  location: string;
  description: string;
  datePosted: string;
  // Optional embeddings field, to integrate with the vector store
  embeddings?: Record<string, number[]>;
}

export interface ResumeData {
  id: string; // UUID v4 string, e.g., '123e4567-e89b-12d3-a456-426614174000'
  content: string;
  // Optional embeddings field, to integrate with the vector store
  embeddings?: Record<string, number[]>;
}

export interface MatchResult {
  jobId: string; // UUID v4
  resumeId: string; // UUID v4
  score: number; // Relevance score, 0–10
  reasoning: string; // Explanation of the score
}
