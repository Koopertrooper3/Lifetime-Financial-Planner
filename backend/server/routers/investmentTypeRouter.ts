import express from 'express';
import { getInvestmentType, getAllInvestmentTypes } from "./../controllers/investmentTypes-controller";
const router = express.Router();

router.get('/:id', getInvestmentType);

router.get('/', getAllInvestmentTypes);

export default router;