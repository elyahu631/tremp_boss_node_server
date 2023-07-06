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
exports.getTrempsByFilters = exports.createTremp = void 0;
const TrempDataAccess_1 = __importDefault(require("./TrempDataAccess"));
const trempDataAccess = new TrempDataAccess_1.default();
function createTremp(tremp) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield trempDataAccess.insertTremp(tremp);
    });
}
exports.createTremp = createTremp;
function getTrempsByFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(filters);
        const query = {
            creator_id: { $ne: filters.creator_id },
            tremp_time: { $gt: filters.tremp_time },
            tremp_type: filters.type_of_tremp,
        };
        return yield trempDataAccess.FindTrempsByFilters(query);
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
//# sourceMappingURL=TrempService.js.map