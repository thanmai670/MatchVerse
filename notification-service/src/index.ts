import express from 'express';
import { subscribeToMatches } from './redisClient';
import dotenv from 'dotenv';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

// Swagger setup
const openapiSpec = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
const swaggerDocument = yaml.load(openapiSpec); // Parse YAML content

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as swaggerUi.JsonObject));


app.listen(port, () => {
  console.log(`Notification Service is running on port ${port}`);
  subscribeToMatches();
});
