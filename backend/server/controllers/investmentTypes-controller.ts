import { Request, Response } from "express";
import InvestmentTypeModel from "../db/InvestmentTypes.js";

const getInvestmentType = async (req : Request, res: Response) => {
  const { id } = req.params;

  try {
    const investmentType = await InvestmentTypeModel.findById(id);
    res.status(200).json({ data : investmentType });
  } catch (error: any) {
    console.log(`Error in fetching investment type ${id}: `, error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllInvestmentTypes = async (req : Request, res: Response) => {
  try {
    const investmentTypes = await InvestmentTypeModel.find({});
    res.status(200).json({ data : investmentTypes });
  } catch (error: any) {
    console.log(`Error in fetching investment types: `, error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export { 
  getInvestmentType,
  getAllInvestmentTypes 
};

