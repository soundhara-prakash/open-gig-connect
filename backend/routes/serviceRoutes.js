import express from 'express';
import { addService, getServices } from '../controllers/serviceController.js';

const router = express.Router();

router.post('/', addService);
router.get('/', getServices);

export default router;
