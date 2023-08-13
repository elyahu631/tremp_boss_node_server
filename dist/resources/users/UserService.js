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
exports.uploadImageToFirebaseAndUpdateUser = exports.deleteUserById = exports.updateUserDetails = exports.createUser = exports.getAllUsers = exports.addUser = exports.uploadUserImage = exports.markUserAsDeleted = exports.updateUser = exports.getUserById = exports.loginUser = exports.registerUser = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = __importDefault(require("./UserModel"));
const UserDataAccess_1 = __importDefault(require("./UserDataAccess"));
const fileUpload_1 = require("../../firebase/fileUpload");
const TimeService_1 = require("../../services/TimeService");
const HttpException_1 = require("../../middleware/HttpException");
const mongodb_1 = require("mongodb");
const userDataAccess = new UserDataAccess_1.default();
const saltRounds = 10;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt(saltRounds);
        return bcrypt_1.default.hash(password, salt);
    });
}
exports.hashPassword = hashPassword;
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
        // return null if user not found or password doesn't match
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            throw new HttpException_1.UnauthorizedException('Invalid email or password.');
        }
        // Update the last_login_date field when the user logs in successfully
        user.last_login_date = (0, TimeService_1.getCurrentTimeInIsrael)();
        yield userDataAccess.UpdateUserDetails(user._id.toString(), user);
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
function updateUser(id, updatedUser) {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.Update(id, updatedUser);
    });
}
exports.updateUser = updateUser;
function markUserAsDeleted(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.UpdateUserDeletionStatus(id);
    });
}
exports.markUserAsDeleted = markUserAsDeleted;
function uploadUserImage(id, file) {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = `usersimages/${id}`;
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        yield userDataAccess.Update(id, { image_URL }); // Pass object with image_URL field
        return image_URL;
    });
}
exports.uploadUserImage = uploadUserImage;
function addUser(user_email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = new UserModel_1.default({ user_email, password });
        return userDataAccess.InsertOne(newUser);
    });
}
exports.addUser = addUser;
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.FindAllUsers({ deleted: false });
    });
}
exports.getAllUsers = getAllUsers;
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if user with this username or email already exists
        const existingUsers = yield userDataAccess.FindAllUsers({
            $or: [
                { user_email: user.user_email },
            ],
        });
        if (!user.user_email) {
            throw new HttpException_1.BadRequestException("email field is empty.");
        }
        else if (existingUsers.length > 0) {
            throw new HttpException_1.BadRequestException("User with this email already exists.");
        }
        // Encrypt the user's password before saving to database
        user.password = yield hashPassword(user.password);
        // Insert the new user into the database
        return userDataAccess.InsertOne(user);
    });
}
exports.createUser = createUser;
function updateUserDetails(id, userDetails, file) {
    return __awaiter(this, void 0, void 0, function* () {
        let updateData = Object.assign(Object.assign({}, userDetails), { updatedAt: (0, TimeService_1.getCurrentTimeInIsrael)() });
        // If a new password is provided, hash it before storing
        if (updateData.password) {
            updateData.password = yield hashPassword(updateData.password);
        }
        // If a file is provided, upload it and update image_URL
        if (file) {
            try {
                const filePath = `usersimages/${id}`;
                updateData.image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
            }
            catch (error) {
                console.error("Error uploading image:", error);
            }
        }
        try {
            const res = yield userDataAccess.UpdateUserDetails(id, updateData);
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
function deleteUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.DeleteUserById(id);
    });
}
exports.deleteUserById = deleteUserById;
function uploadImageToFirebaseAndUpdateUser(file, filePath, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const image_URL = yield (0, fileUpload_1.uploadImageToFirebase)(file, filePath);
        return userDataAccess.UpdateUserDetails(userId, { image_URL });
    });
}
exports.uploadImageToFirebaseAndUpdateUser = uploadImageToFirebaseAndUpdateUser;
//# sourceMappingURL=UserService.js.map