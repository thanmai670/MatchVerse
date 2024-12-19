import { Request, Response } from 'express';
import Job from '../models/Job';

export const createJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Error creating job', details: error });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching jobs', details: error });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json(job);
  } catch (error) {
    res.status(404).json({ error: 'Job not found', details: error });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Error updating job', details: error });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting job', details: error });
  }
};
