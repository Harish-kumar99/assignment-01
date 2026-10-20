import { Router } from 'express';
import { createUser, createTeacher } from '../controllers/userController';
import { createSession, getAvailableSessions, bookSession, completeSession, getUserSessions } from '../controllers/sessionController';

const router = Router();

router.post('/users', createUser);
router.post('/teachers', createTeacher);
router.post('/sessions', createSession);
router.get('/sessions/available', getAvailableSessions);
router.post('/sessions/:id/book', bookSession);
router.patch('/sessions/:id/complete', completeSession);
router.get('/users/:id/sessions', getUserSessions);

export default router;
