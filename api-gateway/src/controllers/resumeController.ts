import { Request, Response } from 'express';
import Resume from '../models/Resume';

export const createResume = async (req: Request, res: Response) => {
  try {
    const resume = await Resume.create(req.body);
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Error creating resume', details: error });
  }
};

export const getResumes = async (req: Request, res: Response) => {
  try {
    const resumes = await Resume.find({ user_id: req.params.user_id });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching resumes', details: error });
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id);
    res.status(200).json(resume);
  } catch (error) {
    res.status(404).json({ error: 'Resume not found', details: error });
  }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ error: 'Error updating resume', details: error });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting resume', details: error });
  }
};
