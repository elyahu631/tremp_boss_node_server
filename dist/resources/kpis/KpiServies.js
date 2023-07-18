"use strict";
// src/resources/kpis/KpiService.ts
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
exports.getDriverStatistics = exports.getHitchhikerStatistics = void 0;
const KpiDataAccess_1 = __importDefault(require("./KpiDataAccess"));
const kpiDataAccess = new KpiDataAccess_1.default();
function getHitchhikerStatistics() {
    return __awaiter(this, void 0, void 0, function* () {
        const openedHitchhikers = yield kpiDataAccess.countTrempsByType('hitchhiker');
        const approvedHitchhikers = yield kpiDataAccess.countApprovedHitchhikers();
        return {
            openedHitchhikers,
            approvedHitchhikers
        };
    });
}
exports.getHitchhikerStatistics = getHitchhikerStatistics;
function getDriverStatistics() {
    return __awaiter(this, void 0, void 0, function* () {
        const openedDrivers = yield kpiDataAccess.countTrempsByType('driver');
        const approvedDrivers = yield kpiDataAccess.countApprovedDrivers();
        return {
            openedDrivers,
            approvedDrivers
        };
    });
}
exports.getDriverStatistics = getDriverStatistics;
//# sourceMappingURL=KpiServies.js.map