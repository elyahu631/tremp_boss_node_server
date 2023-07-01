"use strict";
// src/resources/users/UserService.ts
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
exports.addUser = exports.updateUser = exports.deleteUserById = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = __importDefault(require("./UserModel"));
const UserDataAccess_1 = __importDefault(require("./UserDataAccess"));
const userDataAccess = new UserDataAccess_1.default();
const saltRounds = 10;
function registerUser(user_email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield userDataAccess.FindAllUsers({ user_email });
        if (existingUser && existingUser.length) {
            return null;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const newUser = new UserModel_1.default({
            user_email,
            password: hashedPassword,
        });
        return userDataAccess.InsertOne(newUser);
    });
}
exports.registerUser = registerUser;
function loginUser(user_email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = (yield userDataAccess.FindAllUsers({
            user_email,
            status: "active",
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
        return userDataAccess.FindById(id);
    });
}
exports.getUserById = getUserById;
function deleteUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.DeleteUserById(id);
    });
}
exports.deleteUserById = deleteUserById;
function updateUser(id, updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.Update(id, updatedUser);
    });
}
exports.updateUser = updateUser;
function addUser(user_email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = new UserModel_1.default({ user_email, password });
        return userDataAccess.InsertOne(newUser);
    });
}
exports.addUser = addUser;
//# sourceMappingURL=UserService.js.map