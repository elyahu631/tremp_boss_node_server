"use strict";
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
// src/resources/tremps/TrempDataAccess.ts
const db_1 = __importDefault(require("../../utils/db"));
class TrempDataAccess {
    insertTremp(tremp) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.Insert(TrempDataAccess.collection, tremp);
        });
    }
    FindTrempsByFilters(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const projection = {
                _id: 1,
                creator_id: 1,
                group_id: 1,
                tremp_type: 1,
                tremp_time: 1,
                from_route: 1,
                to_route: 1,
                note: 1,
                seats_amount: 1,
                users_in_tremp: 1,
            };
            return yield db_1.default.FindAll(TrempDataAccess.collection, query, projection, { tremp_time: 1 });
        });
    }
    FindAll(query = {}, projection = {}, sort = { tremp_time: 1 }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.FindAll(TrempDataAccess.collection, query, projection, sort);
        });
    }
    addUserToTremp(tremp_id, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.UpdateWithOperation(TrempDataAccess.collection, tremp_id, query);
        });
    }
    FindByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.FindByID(TrempDataAccess.collection, id);
        });
    }
    Update(id, updateQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.Update(TrempDataAccess.collection, id, updateQuery);
        });
    }
}
TrempDataAccess.collection = 'Tremps';
exports.default = TrempDataAccess;
//# sourceMappingURL=TrempDataAccess.js.map