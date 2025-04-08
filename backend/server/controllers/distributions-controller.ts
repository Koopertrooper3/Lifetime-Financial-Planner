import { Request, Response } from "express";
import DistributionModel from "../db/Distribution";

const getDistribution = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const distribution = await DistributionModel.findById(id);
    res.status(200).json({ data : distribution });
  } catch (error: any) {
    console.log(`Error in fetching distribution ${id}: `, error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export { 
  getDistribution
};