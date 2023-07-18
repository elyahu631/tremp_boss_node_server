// src/resources/kpis/KpiRoutes.ts

import { Router } from "express";
import * as KpiController from "./KpiController";
import { authenticateToken } from "../../middleware/auth";
import { handleErrors } from "../../middleware/handleErrors";

const kpiRoutes = Router();

kpiRoutes.get('/get-total-tremps',authenticateToken, KpiController.getTotalTremps);
kpiRoutes.get('/get-total-tremps-by-gender', authenticateToken, KpiController.getTotalTrempsByGender);

kpiRoutes.use(handleErrors); 

export default kpiRoutes;
