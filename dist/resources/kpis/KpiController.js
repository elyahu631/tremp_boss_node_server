"use strict";
// src/resources/kpis/KpiController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostActiveGroups = exports.getInactiveGroups = exports.getHitchhikerMonthlyCountsByGender = exports.getRideAndTripCounts = exports.getPeopleAndTrempCounts = exports.getAllKPIs = void 0;
const KpiDataAccess_1 = __importDefault(require("./KpiDataAccess"));
const kpiDataAccess = new KpiDataAccess_1.default();
function getAllKPIs(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { startDate, endDate, trempType } = req.body;
            const drivers = yield kpiDataAccess.getTopDrivers(startDate, endDate, trempType);
            const hours = yield kpiDataAccess.getMostRequestedHours(startDate, endDate, trempType);
            const routes = yield kpiDataAccess.getMostPopularRoutes(startDate, endDate, trempType);
            res.status(200).json({
                status: true,
                data: {
                    top_drivers: drivers,
                    top_hours: hours,
                    top_routes: routes
                }
            });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getAllKPIs = getAllKPIs;
function getPeopleAndTrempCounts(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { startDate, endDate, trempType } = req.body;
            const peopleCounts = yield kpiDataAccess.getPeopleAndTrempCounts(startDate, endDate, trempType);
            res.status(200).json({ status: true, data: peopleCounts });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getPeopleAndTrempCounts = getPeopleAndTrempCounts;
function getRideAndTripCounts(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { startDate, endDate, trempType } = req.body;
            const counts = yield kpiDataAccess.getRideAndTripCounts(startDate, endDate, trempType);
            res.status(200).json({ status: true, data: counts });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getRideAndTripCounts = getRideAndTripCounts;
function getHitchhikerMonthlyCountsByGender(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { startDate, endDate, trempType } = req.body;
            const hitchhikerMonthlyCountsByGender = yield kpiDataAccess.getHitchhikerMonthlyCountsByGender(startDate, endDate, trempType);
            res.status(200).json({ status: true, data: hitchhikerMonthlyCountsByGender });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getHitchhikerMonthlyCountsByGender = getHitchhikerMonthlyCountsByGender;
function getInactiveGroups(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const groups = yield kpiDataAccess.getInactiveGroups();
            res.status(200).json({ status: true, data: groups });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getInactiveGroups = getInactiveGroups;
function getMostActiveGroups(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const activeGroups = yield kpiDataAccess.getMostActiveGroups();
            res.status(200).json({ status: true, data: activeGroups });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getMostActiveGroups = getMostActiveGroups;
//# sourceMappingURL=KpiController.js.map