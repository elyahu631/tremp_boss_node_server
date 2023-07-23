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

// export async function getGenderRideCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const counts = await kpiDataAccess.getGenderRideCounts();
//     res.status(200).json({ status: true, data: counts });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function getTotalTremps(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const statistics = await kpiDataAccess.getTotalTremps();
//     res.status(200).json({ status: true, data: statistics });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function getTotalTrempsByGender(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const statistics = await kpiDataAccess.getTotalTrempsByGender();
//     res.status(200).json({ status: true, data: statistics });
//   } catch (err) {
//     next(err);
//   }
// }

// export async function getTotalTrempsByGenderByMonth(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const statistics = await kpiDataAccess.getTotalTrempsByGenderByMonth();
//     res.status(200).json({ status: true, data: statistics });
//   } catch (err) {
//     next(err);
//   }
// }


// export async function getLastOpenedTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
//   try {
//     const trips = await kpiDataAccess.getLastOpenedTrips();
//     res.status(200).json({ status: true, data: trips });
//   } catch (err) {
//     next(err);
//   }
// }