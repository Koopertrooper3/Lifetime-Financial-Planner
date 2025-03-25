import express from 'express';
import { getDistribution } from '../controllers/distributions-controller';
const router = express.Router();

router.get('/:id', getDistribution);

export default router;