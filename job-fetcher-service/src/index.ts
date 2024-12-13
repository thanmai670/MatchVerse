import express from 'express';
// import { scheduleJobFetching } from './fetchJobs';
import dotenv from 'dotenv';
import * as swaggerUi from 'swagger-ui-express';
import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml'
import { fetchJobs,getLocationId, getJobDetails } from './fetchJobs';
import cors from 'cors';


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

// Swagger setup
const openapiSpec = fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8');
const swaggerDocument = yaml.load(openapiSpec); // Parse YAML content

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument as swaggerUi.JsonObject));


app.post('/fetch-jobs', async (req, res) => {
  try {
    const { keywords, locationId, datePosted, sort } = req.body;
    const jobs = await fetchJobs({ keywords, locationId, datePosted, sort });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).send('Error fetching jobs.');
  }
});

app.post('/getLocationId',async(req,res)=>{
  try{
    const{locationName}=req.body;
    const locationId=await getLocationId(locationName); 
    res.status(200).json(locationId);
  }
  catch(error){
    console.error('Error fetching location id:', error);
    res.status(500).send('Error fetching location id.');
  }
})


app.post('/getJobDetails', async (req, res) => {
  try {
    const { id } = req.body;
    const jobDetails = await getJobDetails(id);
    res.status(200).json(jobDetails);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).send('Error fetching job details.');
  }
});

app.listen(port, () => {
  console.log(`Job Fetcher Service is running on port ${port}`);
  // scheduleJobFetching();
});
