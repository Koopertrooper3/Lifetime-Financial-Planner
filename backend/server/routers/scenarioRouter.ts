import express from 'express';
import { getScenario, getAllScenarios } from "../../controllers/scenario-controller"
const router = express.Router();

router.get('/', getAllScenarios);

router.get('/:id', getScenario);

export default router;