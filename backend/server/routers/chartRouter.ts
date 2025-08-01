import {Router, Request, Response} from 'express';
import { ProbabilityRangeChartModel } from '../../db/charts_schema/ProbabilityRangeChartSchema';
import { StackBarDataModel } from '../../db/charts_schema/StackBarDataSchema';
import { SuccessProbabilityChartModel } from '../../db/charts_schema/SuccessProbabilitySchema';
export const router = Router();

router.get('/:id', async (req : Request, res: Response) => {
    const { id } = req.params;

  try {
    const probabilityRange = ProbabilityRangeChartModel.find({ chartID: id })
    const stackBarData = StackBarDataModel.find({ chartID: id })
    const successProbability = SuccessProbabilityChartModel.find({ chartID: id })

    res.status(200).json({
      probabilityRange: probabilityRange,
      stackBarData: stackBarData,
      successProbability: successProbability
    });
  }
  catch (error: unknown) {
    console.log(`Error in fetching scenarios: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});
