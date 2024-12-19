import { Request, Response } from 'express';
import Match from '../models/Match';

export const createMatch = async (req: Request, res: Response) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({ error: 'Error creating match', details: error });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const matches = await Match.find({ user_id: req.params.user_id });
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching matches', details: error });
  }
};
