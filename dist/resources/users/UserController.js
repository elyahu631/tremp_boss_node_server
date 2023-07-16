"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.addNotificationToken = exports.updateUserDetails = exports.AdminAddUser = exports.markUserAsDeleted = exports.getAllUsers = exports.addUser = exports.updateUser = exports.deleteUserById = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../config/environment");
const UserService = __importStar(require("./UserService"));
const UserValidation_1 = require("./UserValidation");
const UserModel_1 = __importDefault(require("./UserModel"));
const HttpException_1 = require("../../middleware/HttpException");
function registerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_email, password } = req.body;
            const result = yield UserService.registerUser(user_email, password);
            if (!result) {
                throw new HttpException_1.UnauthorizedException("Failed to register user");
            }
            res.status(201).json({ status: true, message: "User registered successfully" });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.registerUser = registerUser;
function loginUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_email, password } = req.body;
            const user = yield UserService.loginUser(user_email, password);
            if (!user) {
                throw new HttpException_1.UnauthorizedException('Invalid email or password.');
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id }, environment_1.JWT_SECRET, { expiresIn: '6h' });
            res.status(200).json({ status: true, data: { user, token } });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.loginUser = loginUser;
function getUserById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = yield UserService.getUserById(id);
            res.status(200).json({ status: true, data: user });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getUserById = getUserById;
function deleteUserById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield UserService.deleteUserById(id);
            res.status(200).json({ status: true, message: "User successfully deleted" });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.deleteUserById = deleteUserById;
function updateUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const updatedUser = req.body;
            if (!(0, UserValidation_1.validateUpdatedUser)(updatedUser)) {
                throw new HttpException_1.BadRequestException('Invalid data to update.');
            }
            const user = yield UserService.updateUser(id, updatedUser);
            res.status(200).json({ status: true, message: "User updated successfully", data: user });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.updateUser = updateUser;
function addUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_email, password } = req.body;
            const result = yield UserService.addUser(user_email, password);
            res.status(201).json({ status: true, data: result });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addUser = addUser;
function getAllUsers(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let users = yield UserService.getAllUsers();
            users = users.map(user => (Object.assign(Object.assign({}, user), { password: "user1234" })));
            res.status(200).json({ status: true, data: users });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getAllUsers = getAllUsers;
function markUserAsDeleted(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield UserService.markUserAsDeleted(id);
            res.status(200).json({ status: true, message: "User deletion status successfully updated" });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.markUserAsDeleted = markUserAsDeleted;
function AdminAddUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = new UserModel_1.default(req.body);
            let userInsertion = yield UserService.createUser(newUser);
            let savedUser = userInsertion.insertedId;
            if (req.file) {
                const filePath = `usersimages/${userInsertion.insertedId}`;
                yield UserService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedUser);
                savedUser = yield UserService.getUserById(savedUser); // Get updated user
            }
            res.status(201).json({ status: true, data: savedUser });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.AdminAddUser = AdminAddUser;
function updateUserDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userDetails = req.body;
            if (!(0, UserValidation_1.validateUpdatedUser)(userDetails)) {
                throw new HttpException_1.BadRequestException('Invalid data to update.');
            }
            const updatedUser = yield UserService.updateUserDetails(id, userDetails, req.file);
            res.status(200).json({ status: true, message: "User updated successfully", data: updatedUser });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.updateUserDetails = updateUserDetails;
function addNotificationToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userDetails = req.body;
            if (!(0, UserValidation_1.validateUpdatedUser)(userDetails)) {
                throw new HttpException_1.BadRequestException('Invalid data to update.');
            }
            const updatedUser = yield UserService.updateUserDetails(id, userDetails, req.file);
            res.status(200).json({ status: true, message: "User updated successfully", data: updatedUser });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addNotificationToken = addNotificationToken;
//# sourceMappingURL=UserController.js.map