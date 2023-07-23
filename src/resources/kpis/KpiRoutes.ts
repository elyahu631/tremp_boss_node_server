// src/resources/kpis/KpiRoutes.ts

import { Router } from "express";
import * as KpiController from "./KpiController";
import { authenticateToken } from "../../middleware/auth";
import { handleErrors } from "../../middleware/handleErrors";

const kpiRoutes = Router();

kpiRoutes.get('/get-top-routes', authenticateToken, KpiController.getMostPopularRoutes);
kpiRoutes.get('/get-top-drivers', authenticateToken, KpiController.getTopDrivers);
kpiRoutes.get('/get-top-hours', authenticateToken, KpiController.getMostRequestedHours);
kpiRoutes.get('/get-people-and-tremps-counts', authenticateToken, KpiController.getPeopleAndTrempCounts);
kpiRoutes.get('/get-percentages-per-type', authenticateToken, KpiController.getRideAndTripCounts);
kpiRoutes.get('/get-hitchhiker-monthly-counts-by-gender', authenticateToken, KpiController.getHitchhikerMonthlyCountsByGender);


kpiRoutes.use(handleErrors); 

export default kpiRoutes;

// kpiRoutes.get('/get-total-tremps-by-gender', authenticateToken, KpiController.getTotalTrempsByGender);
// kpiRoutes.get('/get-last-opened-trips', authenticateToken, KpiController.getLastOpenedTrips);
// kpiRoutes.get('/get-total-tremps',authenticateToken, KpiController.getTotalTremps);
// kpiRoutes.get('/get-total-tremps-by-gender-by-month', authenticateToken, KpiController.getTotalTrempsByGenderByMonth);
