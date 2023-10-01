// src/resources/kpis/KpiController.ts

import { NextFunction, Request, Response } from "express";
import KpiDataAccess from "./KpiDataAccess";
const kpiDataAccess = new KpiDataAccess();






export async function getAllKPIs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, trempType } = req.body;
    const drivers = await kpiDataAccess.getTopDrivers(startDate, endDate, trempType);
    const hours = await kpiDataAccess.getMostRequestedHours(startDate, endDate, trempType);
    const routes = await kpiDataAccess.getMostPopularRoutes(startDate, endDate, trempType);

    res.status(200).json({
      status: true,
      data: {
        top_drivers: drivers,
        top_hours: hours,
        top_routes: routes
      }
    });
  } catch (err) {
    next(err);
  }
}


export async function getPeopleAndTrempCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, trempType } = req.body;
    const peopleCounts = await kpiDataAccess.getPeopleAndTrempCounts(startDate, endDate, trempType);
    res.status(200).json({ status: true, data: peopleCounts });
  } catch (err) {
    next(err);
  }
}


export async function getRideAndTripCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, trempType } = req.body;
    const counts = await kpiDataAccess.getRideAndTripCounts(startDate, endDate, trempType);
    res.status(200).json({ status: true, data: counts });
  } catch (err) {
    next(err);
  }
}

export async function getHitchhikerMonthlyCountsByGender(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate, trempType } = req.body;
    const hitchhikerMonthlyCountsByGender = await kpiDataAccess.getHitchhikerMonthlyCountsByGender(startDate, endDate, trempType);
    res.status(200).json({ status: true, data: hitchhikerMonthlyCountsByGender });
  } catch (err) {
    next(err);
  }
}


export async function getInactiveGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const groups = await kpiDataAccess.getInactiveGroups();
    res.status(200).json({ status: true, data: groups });
  } catch (err) {
    next(err);
  }
}

export async function getMostActiveGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activeGroups = await kpiDataAccess.getMostActiveGroups();
    res.status(200).json({ status: true, data: activeGroups });
  } catch (err) {
    next(err);
  }
}
