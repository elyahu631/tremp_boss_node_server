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
class UserGroupsDataAccess {
    constructor() {
        this.db = new db_1.default();
    }
    FindAllUserGroups(query = {}, projection = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.FindAll(UserGroupsDataAccess.collection, query, projection);
        });
    }
    FindById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.FindByID(UserGroupsDataAccess.collection, id);
        });
    }
    InsertOne(userGroups) {
        return __awaiter(this, void 0, void 0, function* () {
            userGroups.validateUserGroupReq();
            return yield new db_1.default().Insert(UserGroupsDataAccess.collection, userGroups);
        });
    }
    UpdateUserGroups(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.Update(UserGroupsDataAccess.collection, id, updateData);
        });
    }
}
UserGroupsDataAccess.collection = 'UserGroups';
exports.default = UserGroupsDataAccess;
//# sourceMappingURL=UserGroupsDataAccess.js.map