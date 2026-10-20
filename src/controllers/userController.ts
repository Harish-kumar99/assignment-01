import { Request, Response } from 'express';
import User from '../models/User';
import Teacher from '../models/Teacher';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      res.status(400).json({ error: 'fullName, email, and phone are required' });
      return;
    }

    const user = await User.create({ fullName, email, phone });
    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, specialization, experience } = req.body;

    if (!fullName || !email || !specialization || experience === undefined) {
      res.status(400).json({ error: 'fullName, email, specialization, and experience are required' });
      return;
    }

    const teacher = await Teacher.create({ fullName, email, specialization, experience });
    res.status(201).json(teacher);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
