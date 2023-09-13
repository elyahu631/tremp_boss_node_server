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
exports.uploadImageToFirebaseAndUpdateUser = exports.updateUserDetails = exports.markUserAsDeleted = exports.getAllUsers = exports.deleteUserById = exports.getUserById = exports.createUser = exports.validateUserByTokenService = exports.loginUser = exports.hashPassword = void 0;
// src/resources/adminUsers/AdminService.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../config/environment");
const bcrypt_1 = __importDefault(require("bcrypt"));
const AdminDataAccess_1 = __importDefault(require("./AdminDataAccess"));
const fileUpload_1 = require("../../firebase/fileUpload");
const TimeService_1 = require("../../services/TimeService");
const HttpException_1 = require("../../middleware/HttpException");
const mongodb_1 = require("mongodb");
const adminDataAccess = new AdminDataAccess_1.default();
const saltRounds = 10;
/**
 * Hashes the provided password using bcrypt.
 * @param password The password to hash.
 * @returns that hashed password.
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt(saltRounds);
        return bcrypt_1.default.hash(password, salt);
    });
}
exports.hashPassword = hashPassword;
/**
 * Logs in an admin user with the provided username and password.
 * @param username The username of the admin user.
 * @param password The password of the admin user.
 * @returns The logged-in user if successful, null otherwise.
 */
function loginUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = (yield adminDataAccess.FindAllUsers({
            username,
            account_activated: true,
            deleted: false,
        })) || [];
        const user = users[0];
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return null;
        }
        yield adminDataAccess.UpdateUserDetails(user._id.toString(), { last_login_date: (0, TimeService_1.getCurrentTimeInIsrael)() });
        return user;
    });
}
exports.loginUser = loginUser;
function validateUserByTokenService(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw new HttpException_1.UnauthorizedException("Invalid token.");
        }
        const user = yield adminDataAccess.FindById(decoded.id);
        if (!user) {
            throw new HttpException_1.NotFoundException("User not found.");
        }
        return { user };
    });
}
exports.validateUserByTokenService = validateUserByTokenService;
/**
 * Creates a new admin user.
 * @param user The user object representing the admin user.
 * @returns The inserted user object.
 * @throws BadRequestException if a user with the same username or email already exists.
 */
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
            throw new HttpException_1.BadRequestException("User with this username or email already exists.");
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
        return adminDataAccess.FindAllUsers({ deleted: false });
    });
}
exports.getAllUsers = getAllUsers;
function markUserAsDeleted(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return adminDataAccess.UpdateUserDeletionStatus(id);
    });
}
exports.markUserAsDeleted = markUserAsDeleted;
/**
 * Updates the details of an admin user.
 * @param id The ID of the admin user to update.
 * @param userDetails The updated details of the admin user.
 * @param file The optional file for updating the user's image.
 * @returns The updated admin user object.
 * @throws BadRequestException if there is an error updating the user details.
 */
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
        // If a file is provided, upload it and update image_URL
        if (file) {
            try {
                const filePath = `adminimages/${id}`;
                updateData.image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
            }
            catch (error) {
                throw new HttpException_1.InternalServerException("Error uploading image: " + error);
            }
        }
        try {
            const res = yield adminDataAccess.UpdateUserDetails(id, updateData);
            return res;
        }
        catch (error) {
            if (error instanceof mongodb_1.MongoError && error.code === 11000) {
                // This error code stands for 'Duplicate Key Error'
                const keyValue = error.keyValue;
                throw new HttpException_1.BadRequestException(`User with this ${Object.keys(keyValue)[0]} already exists.`);
            }
            throw new HttpException_1.BadRequestException("Error updating user details: " + error);
        }
    });
}
exports.updateUserDetails = updateUserDetails;
/**
 * Uploads an image to Firebase and updates the user's image URL.
 * @param file The file to upload.
 * @param filePath The file path in Firebase storage.
 * @param userId The ID of the user to update.
 * @returns The updated user object.
 */
function uploadImageToFirebaseAndUpdateUser(file, filePath, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return adminDataAccess.UpdateUserDetails(userId, { image_URL });
    });
}
exports.uploadImageToFirebaseAndUpdateUser = uploadImageToFirebaseAndUpdateUser;
//# sourceMappingURL=AdminService.js.map