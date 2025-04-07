import { Request, Response } from 'express';
import { scenarioModel as ScenarioModel } from "../../db/Scenario";

const getScenario = async (req : Request, res: Response) => {
  const { id } = req.params;

  try {
    const scenario = await ScenarioModel.findById(id);
    res.status(200).json({ data : scenario });
  } catch (error: unknown) {
    console.log(`Error in fetching scenario ${id}: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllScenarios = async (req : Request, res: Response) => {
  try {
    const scenarios = await ScenarioModel.find({});
    res.status(200).json({ data : scenarios });
  }
  catch (error: unknown) {
    console.log(`Error in fetching scenarios: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
}

export {
  getScenario,
  getAllScenarios
}