import { Router } from 'express';
import { getUsers, blockUsers, unblockUsers, deleteUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsers); // GET /api/users
router.post('/block', blockUsers); // POST /api/users/block
router.post('/unblock', unblockUsers); // POST /api/users/unblock
router.delete('/delete', deleteUsers); // DELETE /api/users/delete

export default router;
