import { Request, Response } from "express";
import InvestmentTypeModel from "../../db/old/InvestmentTypes";

const getInvestmentType = async (req : Request, res: Response) => {
  const { id } = req.params;

  try {
    // const investmentType = await InvestmentTypeModel.findById(id);
    res.status(200).json({ });
  } catch (error: unknown) {
    console.log(`Error in fetching investment type ${id}: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllInvestmentTypes = async (req : Request, res: Response) => {
  try {
    const investmentTypes = await InvestmentTypeModel.find({});
    res.status(200).json({ data: investmentTypes });
  } catch (error: unknown) {
    console.log(`Error in fetching investment types: `, (error as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
};

export { 
  getInvestmentType,
  getAllInvestmentTypes 
};

