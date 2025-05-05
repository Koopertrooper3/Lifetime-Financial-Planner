import {Router, Request, Response} from 'express';
import { ProbabilityRangeChartModel } from '../../db/charts_schema/ProbabilityRangeChartSchema';
import { StackBarDataModel } from '../../db/charts_schema/StackBarDataSchema';
import { SuccessProbabilityChartModel } from '../../db/charts_schema/SuccessProbabilitySchema';
export const router = Router();

// router.get('/probabilityOfSuccess', async (req: Request, res: Response) => {
//   try {
//     const { userId, scenarioId, numScenario } = req.query;

//     if (!userId || !scenarioId || !numScenario) {
//       return res.status(400).json({ 
//         error: 'Missing required query parameters: userId, scenarioId, numScenario' 
//       });
//     }

//     const chartData = await SuccessProbabilityChartModel.findOne({ 
//       chartID: `${userId}_${scenarioId}_${numScenario}`
//     });

//     if (!chartData) {
//       return res.status(404).json({ error: 'Chart data not found' });
//     }

//     res.json({
//       success: true,
//       data: chartData.probabilities
//     });

//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });