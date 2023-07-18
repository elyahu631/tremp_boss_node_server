"use strict";
// src/resources/kpis/KpiDataAccess.ts
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
const db_1 = __importDefault(require("../../utils/db"));
class KpiDataAccess extends db_1.default {
    constructor() {
        super('tremps');
    }
    countTrempsByType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbCollection.countDocuments({ tremp_type: type });
        });
    }
    countApprovedHitchhikers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbCollection.countDocuments({ tremp_type: 'hitchhiker', 'users_in_tremp.is_approved': 'approved' });
        });
    }
    countApprovedDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dbCollection.countDocuments({ tremp_type: 'driver', 'users_in_tremp.is_approved': 'approved' });
        });
    }
}
exports.default = KpiDataAccess;
//# sourceMappingURL=KpiDataAccess.js.map