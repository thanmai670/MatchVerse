import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 80;

app.use('/jobs', createProxyMiddleware({ target: 'http://job-fetcher-service:3001', changeOrigin: true }));
app.use('/resume', createProxyMiddleware({ target: 'http://resume-analyzer-service:3002', changeOrigin: true }));
app.use('/match', createProxyMiddleware({ target: 'http://matching-engine-service:3003', changeOrigin: true }));
app.use('/notify', createProxyMiddleware({ target: 'http://notification-service:3004', changeOrigin: true }));

app.listen(port, () => {
  console.log(`API Gateway is running on port ${port}`);
});
