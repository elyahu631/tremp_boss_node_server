// src/resources/kpis/KpiRoutes.ts

import { Router } from "express";
import * as KpiController from "./KpiController";
import { authenticateAdminToken } from "../../middleware/auth";
import { handleErrors } from "../../middleware/handleErrors";

const kpiRoutes = Router();

// kpiRoutes.get('/get-top-routes', authenticateAdminToken, KpiController.getMostPopularRoutes);
// kpiRoutes.get('/get-top-drivers', authenticateAdminToken, KpiController.getTopDrivers);
// kpiRoutes.get('/get-top-hours', authenticateAdminToken, KpiController.getMostRequestedHours);
kpiRoutes.post('/get-all-top-five', authenticateAdminToken, KpiController.getAllKPIs);
kpiRoutes.post('/get-people-and-tremps-counts', authenticateAdminToken, KpiController.getPeopleAndTrempCounts);
kpiRoutes.post('/get-percentages-per-type', authenticateAdminToken, KpiController.getRideAndTripCounts);
kpiRoutes.post('/get-hitchhiker-monthly-counts-by-gender', authenticateAdminToken, KpiController.getHitchhikerMonthlyCountsByGender);
// Add the following line
kpiRoutes.get('/get-inactive-groups', authenticateAdminToken, KpiController.getInactiveGroups);
kpiRoutes.get('/get-most-active-groups', authenticateAdminToken, KpiController.getMostActiveGroups);


kpiRoutes.use(handleErrors);

export default kpiRoutes;

// kpiRoutes.get('/get-total-tremps-by-gender', authenticateToken, KpiController.getTotalTrempsByGender);
// kpiRoutes.get('/get-last-opened-trips', authenticateToken, KpiController.getLastOpenedTrips);
// kpiRoutes.get('/get-total-tremps',authenticateToken, KpiController.getTotalTremps);
// kpiRoutes.get('/get-total-tremps-by-gender-by-month', authenticateToken, KpiController.getTotalTrempsByGenderByMonth);
