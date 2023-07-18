// src/resources/kpis/KpiController.ts

import { NextFunction, Request, Response } from "express";
import KpiDataAccess from "./KpiDataAccess";
const kpiDataAccess = new KpiDataAccess();

export async function getTotalTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const statistics = await kpiDataAccess.getTotalTremps();
    res.status(200).json({ status: true, data: statistics });
  } catch (err) {
    next(err);
  }
}

export async function getTotalTrempsByGender(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const statistics = await kpiDataAccess.getTotalTrempsByGender();
    res.status(200).json({ status: true, data: statistics });
  } catch (err) {
    next(err);
  }
}