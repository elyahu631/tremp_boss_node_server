"use strict";
// src/resources/kpis/KpiRoutes.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const KpiController = __importStar(require("./KpiController"));
const auth_1 = require("../../middleware/auth");
const handleErrors_1 = require("../../middleware/handleErrors");
const kpiRoutes = (0, express_1.Router)();
// kpiRoutes.get('/get-top-routes', authenticateAdminToken, KpiController.getMostPopularRoutes);
// kpiRoutes.get('/get-top-drivers', authenticateAdminToken, KpiController.getTopDrivers);
// kpiRoutes.get('/get-top-hours', authenticateAdminToken, KpiController.getMostRequestedHours);
kpiRoutes.post('/get-all-top-five', auth_1.authenticateAdminToken, KpiController.getAllKPIs);
kpiRoutes.post('/get-people-and-tremps-counts', auth_1.authenticateAdminToken, KpiController.getPeopleAndTrempCounts);
kpiRoutes.post('/get-percentages-per-type', auth_1.authenticateAdminToken, KpiController.getRideAndTripCounts);
kpiRoutes.post('/get-hitchhiker-monthly-counts-by-gender', auth_1.authenticateAdminToken, KpiController.getHitchhikerMonthlyCountsByGender);
// Add the following line
kpiRoutes.get('/get-inactive-groups', auth_1.authenticateAdminToken, KpiController.getInactiveGroups);
kpiRoutes.get('/get-most-active-groups', auth_1.authenticateAdminToken, KpiController.getMostActiveGroups);
kpiRoutes.use(handleErrors_1.handleErrors);
exports.default = kpiRoutes;
// kpiRoutes.get('/get-total-tremps-by-gender', authenticateToken, KpiController.getTotalTrempsByGender);
// kpiRoutes.get('/get-last-opened-trips', authenticateToken, KpiController.getLastOpenedTrips);
// kpiRoutes.get('/get-total-tremps',authenticateToken, KpiController.getTotalTremps);
// kpiRoutes.get('/get-total-tremps-by-gender-by-month', authenticateToken, KpiController.getTotalTrempsByGenderByMonth);
//# sourceMappingURL=KpiRoutes.js.map