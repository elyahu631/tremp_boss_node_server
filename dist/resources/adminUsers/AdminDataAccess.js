"use strict";
// src/resources/adminUsers/AdminDataAccess.ts
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
class AdminDataAccess {
    FindAllUsers(query = {}, projection = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new db_1.default().FindAll(AdminDataAccess.collection, query, projection);
        });
    }
    FindById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new db_1.default().FindByID(AdminDataAccess.collection, id);
        });
    }
    DeleteUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new db_1.default().DeleteById(AdminDataAccess.collection, id);
        });
    }
    InsertOne(admin) {
        return __awaiter(this, void 0, void 0, function* () {
            admin.validateNewAdmin();
            return yield new db_1.default().Insert(AdminDataAccess.collection, admin);
        });
    }
    UpdateUserDeletionStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield new db_1.default().Update(AdminDataAccess.collection, id, {
                    deleted: true,
                    account_activated: false
                });
            }
            catch (error) {
                return error;
            }
        });
    }
    UpdateUserDetails(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new db_1.default().Update(AdminDataAccess.collection, id, updateData);
        });
    }
}
AdminDataAccess.collection = 'AdminUsers';
exports.default = AdminDataAccess;
//# sourceMappingURL=AdminDataAccess.js.map