import {Router, Request, Response} from 'express';
import { ProbabilityRangeChartModel } from '../../db/charts_schema/ProbabilityRangeChartSchema';
import { StackBarDataModel } from '../../db/charts_schema/StackBarDataSchema';
import { SuccessProbabiltyChartModel } from '../../db/charts_schema/SuccessProbabilitySchema';
export const router = Router();
