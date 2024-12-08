import express from 'express';
import multer from 'multer';
import { analyzeResume } from './analyzeResume';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = process.env.PORT || 3002;
const upload = multer();

app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).send('No resume file uploaded.');

  try {
    const resumeText = req.file.buffer.toString('utf-8');
    const extractedResume = await analyzeResume(resumeText);
    res.status(200).json(extractedResume);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).send('Error analyzing resume.');
  }
});

app.listen(port, () => {
  console.log(`Resume Analyzer Service is running on port ${port}`);
});
