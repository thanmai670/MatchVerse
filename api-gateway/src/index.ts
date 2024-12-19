import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';

import connectDB from './config/db';
import { authenticateUser } from './middlewares/authMiddleware';

// Import routes for CRUD logic
import agentRoutes from './routes/agentRoutes';
import jobRoutes from './routes/jobRoutes';
import resumeRoutes from './routes/resumeRoutes';
import matchRoutes from './routes/matchRoutes';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

dotenv.config();

const app = express();
const port = process.env.PORT || 80;

// Connect to MongoDB
connectDB();

// Middleware

app.use(cors());
app.use(express.json());
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as swaggerUi.JsonObject));

// Keycloak JWT authentication for all routes
app.use(authenticateUser);

// **NEW CRUD ROUTES** (Handled by the API Gateway itself)
app.use('/api/agents', agentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/matches', matchRoutes);

// **PROXY ROUTES** (Forward requests to other microservices)
app.use('/jobs', createProxyMiddleware({ target: 'http://job-fetcher-service:3001', changeOrigin: true }));
app.use('/resume', createProxyMiddleware({ target: 'http://resume-analyzer-service:3002', changeOrigin: true }));
app.use('/match', createProxyMiddleware({ target: 'http://matching-engine-service:3003', changeOrigin: true }));
app.use('/notify', createProxyMiddleware({ target: 'http://notification-service:3004', changeOrigin: true }));

// Swagger API documentation

// Start the server
app.listen(port, () => {
  console.log(`API Gateway is running on port ${port}`);
});
