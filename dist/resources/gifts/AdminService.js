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
exports.uploadImageToFirebaseAndUpdateUser = exports.updateUserDetails = exports.markUserAsDeleted = exports.getAllUsers = exports.deleteUserById = exports.getUserById = exports.createUser = exports.loginUser = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminDataAccess_1 = __importDefault(require("./AdminDataAccess"));
const fileUpload_1 = require("../../firebase/fileUpload");
const TimeService_1 = require("../../utils/TimeService");
const adminDataAccess = new AdminDataAccess_1.default();
const saltRounds = 10;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt(saltRounds);
        return bcrypt_1.default.hash(password, salt);
    });
}
exports.hashPassword = hashPassword;
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
        yield adminDataAccess.UpdateUserDetails(user._id.toString(), { last_login_date: (0, TimeService_1.getCurrentTimeInIsrael)() });
        return user;
    });
}
exports.loginUser = loginUser;
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if user with this username or email already exists
        const existingUsers = yield adminDataAccess.FindAllUsers({
            $or: [
                { username: user.username },
                { email: user.email },
                { phone_number: user.phone_number },
            ],
        });
        if (existingUsers.length > 0) {
            throw new Error("User with this username or email already exists.");
        }
        // Encrypt the user's password before saving to database
        user.password = yield hashPassword(user.password);
        user.account_activated = (user.account_activated.toString() === 'true');
        // Insert the new user into the database
        return adminDataAccess.InsertOne(user);
    });
}
exports.createUser = createUser;
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
        return adminDataAccess.FindAllUsers();
    });
}
exports.getAllUsers = getAllUsers;
function markUserAsDeleted(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return adminDataAccess.UpdateUserDeletionStatus(id);
    });
}
exports.markUserAsDeleted = markUserAsDeleted;
function updateUserDetails(id, userDetails, file) {
    return __awaiter(this, void 0, void 0, function* () {
        let updateData = Object.assign(Object.assign({}, userDetails), { updatedAt: (0, TimeService_1.getCurrentTimeInIsrael)() });
        // If account_activated is defined, ensure it is a boolean
        if (updateData.account_activated !== undefined) {
            updateData.account_activated = "" + updateData.account_activated === "true";
        }
        // If a new password is provided, hash it before storing
        if (updateData.password) {
            updateData.password = yield hashPassword(updateData.password);
        }
        // If a file is provided, upload it and update photo_URL
        if (file) {
            try {
                const filePath = `adminimages/${id}`;
                updateData.photo_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
            }
            catch (error) {
                console.error("Error uploading image:", error);
            }
        }
        try {
            return yield adminDataAccess.UpdateUserDetails(id, updateData);
        }
        catch (error) {
            console.error("Error updating user details:", error);
            throw (error);
        }
    });
}
exports.updateUserDetails = updateUserDetails;
function uploadImageToFirebaseAndUpdateUser(file, filePath, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const photo_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return adminDataAccess.UpdateUserDetails(userId, { photo_URL });
    });
}
exports.uploadImageToFirebaseAndUpdateUser = uploadImageToFirebaseAndUpdateUser;
//# sourceMappingURL=AdminService.js.map