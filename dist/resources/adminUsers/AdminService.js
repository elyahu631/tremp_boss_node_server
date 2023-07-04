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
exports.uploadImageToFirebaseAndUpdateUser = exports.updateUserDetails = exports.markUserAsDeleted = exports.getAllUsers = exports.deleteUserById = exports.getUserById = exports.createUser = exports.loginUser = exports.getCurrentTimeInIsrael = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminDataAccess_1 = __importDefault(require("./AdminDataAccess"));
const fileUpload_1 = require("../../firebase/fileUpload");
const date_fns_tz_1 = require("date-fns-tz");
const adminDataAccess = new AdminDataAccess_1.default();
const saltRounds = 10;
function getCurrentTimeInIsrael() {
    const timeZone = 'Asia/Jerusalem';
    const loginDate = new Date();
    // Convert the date in that timezone
    const zonedDate = (0, date_fns_tz_1.utcToZonedTime)(loginDate, timeZone);
    const loginDateISOString = (0, date_fns_tz_1.format)(zonedDate, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone });
    return loginDateISOString;
}
exports.getCurrentTimeInIsrael = getCurrentTimeInIsrael;
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
        yield adminDataAccess.UpdateUserDetails(user._id.toString(), { last_login_date: getCurrentTimeInIsrael() });
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
        const salt = bcrypt_1.default.genSaltSync(saltRounds);
        user.password = bcrypt_1.default.hashSync(user.password, salt);
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
function updateUserDetails(id, userDetails, file) {
    return __awaiter(this, void 0, void 0, function* () {
        let updateData = {
            username: userDetails.username,
            email: userDetails.email,
            first_name: userDetails.first_name,
            last_name: userDetails.last_name,
            role: userDetails.role,
            phone_number: userDetails.phone_number,
            photo_URL: userDetails.photo_URL,
            account_activated: userDetails.account_activated,
            password: userDetails.password,
            updatedAt: getCurrentTimeInIsrael()
        };
        updateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));
        if (updateData.account_activated) {
            updateData.account_activated = (updateData.account_activated.toString() === 'true');
        }
        if (file) {
            const filePath = `adminimages/${id}`;
            updateData.photo_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        }
        return adminDataAccess.UpdateUserDetails(id, updateData);
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