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
const db_1 = __importDefault(require("../../utils/db"));
class GroupRequesDataAccess {
    FindAllGroupReq(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.FindAll(GroupRequesDataAccess.collection, query, {}, { request_date: 1, group_name: 1 });
        });
    }
    FindById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.FindByID(GroupRequesDataAccess.collection, id);
        });
    }
    DeleteGroupReqById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.DeleteById(GroupRequesDataAccess.collection, id);
        });
    }
    InsertOne(groupReq) {
        return __awaiter(this, void 0, void 0, function* () {
            groupReq.validateGroupRequest();
            return yield db_1.default.Insert(GroupRequesDataAccess.collection, groupReq);
        });
    }
    UpdateGroup(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_1.default.Update(GroupRequesDataAccess.collection, id, updateData);
        });
    }
}
GroupRequesDataAccess.collection = 'GroupRequests';
exports.default = GroupRequesDataAccess;
//# sourceMappingURL=GroupRequestDataAccess.js.map