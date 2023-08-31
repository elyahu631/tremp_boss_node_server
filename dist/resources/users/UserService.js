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
exports.getUserGroups = exports.uploadImageToFirebaseAndUpdateUser = exports.deleteUserById = exports.updateUserDetails = exports.createUser = exports.getAllUsers = exports.uploadUserImage = exports.markUserAsDeleted = exports.updateUser = exports.getUserById = exports.loginUser = exports.registerUser = exports.hashPassword = void 0;
// src/resources/users/UserService.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserModel_1 = __importDefault(require("./UserModel"));
const UserDataAccess_1 = __importDefault(require("./UserDataAccess"));
const GroupDataAccess_1 = __importDefault(require("../groups/GroupDataAccess"));
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
function registerUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUser = yield userDataAccess.FindAllUsers({ email });
        if (existingUser && existingUser.length) {
            return null;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        const newUser = new UserModel_1.default({
            email,
            password: hashedPassword,
        });
        // const verificationToken = crypto.randomBytes(20).toString('hex');
        const result = yield userDataAccess.InsertOne(newUser);
        // if (result) {
        //   const emailService = new EmailService();
        //   emailService.sendVerificationEmail(email, verificationToken); // Send a verification email
        // }
        return result;
    });
}
exports.registerUser = registerUser;
function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = (yield userDataAccess.FindAllUsers({
            email,
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
        const userModel = UserModel_1.default.fromUserDocument(user);
        const isProfileComplete = userModel.isProfileComplete();
        return { user, isProfileComplete };
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
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        return userDataAccess.FindAllUsers({ deleted: false });
    });
}
exports.getAllUsers = getAllUsers;
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!user.email) {
            throw new HttpException_1.BadRequestException("email field is empty.");
        }
        user.email = user.email.toLowerCase();
        // Check if user with this username or email already exists
        const existingUsers = yield userDataAccess.FindAllUsers({
            $or: [
                { email: user.email },
            ],
        });
        if (existingUsers.length > 0) {
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
function getUserGroups(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield userDataAccess.FindById(userId);
        if (!user) {
            throw new HttpException_1.BadRequestException("User not found");
        }
        const groupDataAccess = new GroupDataAccess_1.default();
        const groupIds = user.groups || [];
        // Use the query to filter out the groups directly in the database
        const userGroups = yield groupDataAccess.FindAllGroups({
            _id: { $in: groupIds },
            deleted: false,
            active: "active"
        }, {
            group_name: 1,
            type: 1,
            locations: 1,
        });
        return userGroups;
    });
}
exports.getUserGroups = getUserGroups;
//# sourceMappingURL=UserService.js.map