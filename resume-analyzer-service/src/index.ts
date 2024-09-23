import express from 'express';
import multer from 'multer';
import { analyzeResume } from './analyzeResume';
import dotenv from 'dotenv';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const upload = multer();

const openapiSpec = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
const swaggerDocument = yaml.load(openapiSpec); // Parse YAML content

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as swaggerUi.JsonObject));


app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No resume file uploaded.');
  }

  try {
    const resumeText = req.file.buffer.toString('utf-8');
    console.log('Received resume text');
    await analyzeResume(resumeText);
    res.status(200).send('Resume analyzed successfully.');
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).send('Error analyzing resume.');
  }
});

app.listen(port, () => {
  console.log(`Resume Analyzer Service is running on port ${port}`);
});
