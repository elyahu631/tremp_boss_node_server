"use strict";
// src/resources/adminUsers/AdminService.ts
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
exports.markUserAsDeleted = exports.getAllUsers = exports.deleteUserById = exports.getUserById = exports.loginUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminDataAccess_1 = __importDefault(require("./AdminDataAccess"));
const adminDataAccess = new AdminDataAccess_1.default();
const saltRounds = 10;
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if user with this username or email already exists
        const existingUsers = yield adminDataAccess.FindAllUsers({
            $or: [
                { username: user.username },
                { email: user.email }
            ]
        });
        if (existingUsers.length > 0) {
            throw new Error("User with this username or email already exists.");
        }
        // Encrypt the user's password before saving to database
        const salt = bcrypt_1.default.genSaltSync(saltRounds);
        user.password = bcrypt_1.default.hashSync(user.password, salt);
        // Insert the new user into the database
        return adminDataAccess.InsertOne(user);
    });
}
exports.createUser = createUser;
function loginUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = (yield adminDataAccess.FindAllUsers({
            username,
            account_activated: true,
            deleted: false,
        })) || [];
        const user = users[0];
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            // return null if user not found or password doesn't match
            return null;
        }
        return user;
    });
}
exports.loginUser = loginUser;
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return adminDataAccess.FindById(id);
    });
}
exports.getUserById = getUserById;
function deleteUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return adminDataAccess.DeleteUserById(id);
    });
}
exports.deleteUserById = deleteUserById;
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return adminDataAccess.FindAllUsers({}, { password: 0 });
    });
}
exports.getAllUsers = getAllUsers;
function markUserAsDeleted(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return adminDataAccess.UpdateUserDeletionStatus(id);
    });
}
exports.markUserAsDeleted = markUserAsDeleted;
//# sourceMappingURL=AdminService.js.map