import {Router, Request, Response} from 'express';
import { ProbabilityRangeChartModel } from '../../db/charts_schema/ProbabilityRangeChartSchema';
import { StackBarDataModel } from '../../db/charts_schema/StackBarDataSchema';
import { SuccessProbabiltyChartModel } from '../../db/charts_schema/SuccessProbabilitySchema';
export const router = Router();

<<<<<<< Updated upstream

router.get('/:id', async (req : Request, res: Response) => {
    const { id } = req.params;

  try {
    const probabilityRange = ProbabilityRangeChartModel.find({ chartID: id })
    const stackBarData = StackBarDataModel.find({ chartID: id })
    const successProbabolity = SuccessProbabiltyChartModel.find({ chartID: id })

    res.status(200).json({});
  }
  catch (error: unknown) {
    console.log(`Error in fetching scenarios: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
=======
router.get('/probabilityOfSuccess', async (req: Request, res: Response) => {
  try {
    const { userId, scenarioId, numScenario } = req.query;

    if (!userId || !scenarioId || !numScenario) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: userId, scenarioId, numScenario' 
      });
    }

    const chartData = await SuccessProbabilityChartModel.findOne({ 
      chartID: `${userId}_${scenarioId}_${numScenario}`
    });

    if (!chartData) {
      return res.status(404).json({ error: 'Chart data not found' });
    }

    res.json({
      success: true,
      data: chartData.probabilities
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
>>>>>>> Stashed changes
  }
});