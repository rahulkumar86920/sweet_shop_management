import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';
import {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet
} from '../controllers/sweets.controller.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Public routes (authenticated users)
router.get('/', getAllSweets);
router.get('/search', searchSweets);
router.post('/:id/purchase', purchaseSweet);

// Admin only routes
router.post('/', isAdmin, createSweet);
router.put('/:id', isAdmin, updateSweet);
router.delete('/:id', isAdmin, deleteSweet);
router.post('/:id/restock', isAdmin, restockSweet);

export default router;