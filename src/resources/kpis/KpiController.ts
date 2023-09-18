// src/resources/kpis/KpiController.ts

import { NextFunction, Request, Response } from "express";
import KpiDataAccess from "./KpiDataAccess";
const kpiDataAccess = new KpiDataAccess();




export async function getMostPopularRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routes = await kpiDataAccess.getMostPopularRoutes();
    res.status(200).json({ status: true, data: routes });
  } catch (err) {
    next(err);
  }
}

export async function getTopDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const drivers = await kpiDataAccess.getTopDrivers();
    res.status(200).json({ status: true, data: drivers });
  } catch (err) {
    next(err);
  }
}

export async function getMostRequestedHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hours = await kpiDataAccess.getMostRequestedHours();
    res.status(200).json({ status: true, data: hours });
  } catch (err) {
    next(err);
  }
}


export async function getAllKPIs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const drivers = await kpiDataAccess.getTopDrivers();
    const hours = await kpiDataAccess.getMostRequestedHours();
    const routes = await kpiDataAccess.getMostPopularRoutes();
    
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
    const peopleCounts = await kpiDataAccess.getPeopleAndTrempCounts();
    res.status(200).json({ status: true, data: peopleCounts });
  } catch (err) {
    next(err);
  }
}


export async function getRideAndTripCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const counts = await kpiDataAccess.getRideAndTripCounts();
    res.status(200).json({ status: true, data: counts });
  } catch (err) {
    next(err);
  }
}

export async function getHitchhikerMonthlyCountsByGender(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hitchhikerMonthlyCountsByGender = await kpiDataAccess.getHitchhikerMonthlyCountsByGender();
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
