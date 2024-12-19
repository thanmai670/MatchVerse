import { Request, Response } from 'express';
import Agent from '../models/Agent';

export const createAgent = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.create(req.body);
    res.status(201).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Error creating agent', details: error });
  }
};

export const getAgents = async (req: Request, res: Response) => {
  try {
    const agents = await Agent.find({ user_id: req.params.user_id });
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching agents', details: error });
  }
};

export const getAgentById = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.findById(req.params.id);
    res.status(200).json(agent);
  } catch (error) {
    res.status(404).json({ error: 'Agent not found', details: error });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ error: 'Error updating agent', details: error });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting agent', details: error });
  }
};
