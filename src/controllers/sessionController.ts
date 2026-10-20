import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Session, { SessionStatus } from '../models/Session';
import Teacher from '../models/Teacher';
import User from '../models/User';

export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teacherId, startTime, endTime } = req.body;

    if (!teacherId || !startTime || !endTime) {
      console.error('Failed to create session: teacherId, startTime, and endTime are required');
      res.status(400).json({ error: 'teacherId, startTime, and endTime are required' });
      return;
    }

    if (!mongoose.isObjectIdOrHexString(teacherId)) {
      console.error('Failed to create session: teacherId must be a valid MongoDB ObjectId');
      res.status(400).json({ error: 'teacherId must be a valid MongoDB ObjectId' });
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      console.error('Failed to create session: startTime and endTime must be valid dates');
      res.status(400).json({ error: 'startTime and endTime must be valid dates' });
      return;
    }

    if (endDate <= startDate) {
      console.error('Failed to create session: endTime must be greater than startTime');
      res.status(400).json({ error: 'endTime must be greater than startTime' });
      return;
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      console.error(`Failed to create session: teacher not found (${teacherId})`);
      res.status(404).json({ error: 'Teacher not found' });
      return;
    }

    const session = await Session.create({
      teacherId,
      startTime: startDate,
      endTime: endDate,
      status: SessionStatus.AVAILABLE
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailableSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateTimestamp } = req.query;

    if (!dateTimestamp) {
      res.status(400).json({ error: 'dateTimestamp is required' });
      return;
    }

    const date = new Date(Number(dateTimestamp));
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const sessions = await Session.aggregate([
      {
        $match: {
          status: SessionStatus.AVAILABLE,
          startTime: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      },
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          teacher: {
            _id: 1,
            fullName: 1,
            email: 1,
            specialization: 1,
            experience: 1
          }
        }
      }
    ]);

    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bookSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.status !== SessionStatus.AVAILABLE) {
      res.status(400).json({ error: 'Session is not available for booking' });
      return;
    }

    session.userId = user._id;
    session.status = SessionStatus.BOOKED;
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    if (session.status !== SessionStatus.BOOKED) {
      res.status(400).json({ error: 'Only booked sessions can be marked as completed' });
      return;
    }

    session.status = SessionStatus.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const sessions = await Session.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      {
        $unwind: '$teacher'
      },
      {
        $sort: { startTime: 1 }
      },
      {
        $project: {
          _id: 1,
          startTime: 1,
          endTime: 1,
          status: 1,
          completedAt: 1,
          teacher: {
            _id: 1,
            fullName: 1,
            email: 1,
            specialization: 1,
            experience: 1
          }
        }
      }
    ]);

    const upcomingSessions = sessions.filter(
      (session: any) => session.status === SessionStatus.BOOKED
    );
    const completedSessions = sessions.filter(
      (session: any) => session.status === SessionStatus.COMPLETED
    );

    res.status(200).json({
      upcomingSessions,
      completedSessions
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
