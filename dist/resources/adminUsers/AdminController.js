"use strict";
// src/resources/adminUsers/AdminController.ts
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
exports.updateAdminUserDetails = exports.addAdminUser = exports.getUserFromToken = exports.markAdminUserAsDeleted = exports.getAllAdminUsers = exports.deleteAdminUserById = exports.getAdminUserById = exports.loginAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../config/environment");
const AdminValidation_1 = require("./AdminValidation");
const AdminService = __importStar(require("./AdminService"));
const AdminModel_1 = __importDefault(require("./AdminModel"));
const HttpException_1 = require("../../middleware/HttpException");
function loginAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                throw new HttpException_1.BadRequestException('Username and password are required');
            }
            const user = yield AdminService.loginUser(username, password);
            if (!user) {
                throw new HttpException_1.UnauthorizedException("Invalid user or password.");
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id }, environment_1.JWT_SECRET, { expiresIn: "8h" });
            res.status(200).json({ status: true, data: { user, token } });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.loginAdmin = loginAdmin;
function getAdminUserById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!id) {
                throw new HttpException_1.BadRequestException('User ID is required');
            }
            const user = yield AdminService.getUserById(id);
            if (!user) {
                throw new HttpException_1.NotFoundException("User not found.");
            }
            res.status(200).json({ status: true, data: user });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getAdminUserById = getAdminUserById;
function deleteAdminUserById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!id) {
                throw new HttpException_1.BadRequestException('User ID is required');
            }
            yield AdminService.deleteUserById(id);
            res.status(200).json({ status: true, data: { message: "User successfully deleted" } });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.deleteAdminUserById = deleteAdminUserById;
function getAllAdminUsers(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let users = yield AdminService.getAllUsers();
            users = users.map(user => (Object.assign(Object.assign({}, user), { password: "admin123" })));
            res.status(200).json({ status: true, data: users });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getAllAdminUsers = getAllAdminUsers;
function markAdminUserAsDeleted(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!id) {
                throw new HttpException_1.BadRequestException('User ID is required');
            }
            yield AdminService.markUserAsDeleted(id);
            res.status(200).json({ status: true, data: { message: "User deletion status successfully updated" } });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.markAdminUserAsDeleted = markAdminUserAsDeleted;
function getUserFromToken(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
            if (!token) {
                throw new HttpException_1.ForbiddenException("No token provided");
            }
            jsonwebtoken_1.default.verify(token, environment_1.JWT_SECRET, (err, decoded) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    throw new HttpException_1.UnauthorizedException("Failed to authenticate token.");
                }
                const user = yield AdminService.getUserById(decoded.id);
                if (!user) {
                    throw new HttpException_1.NotFoundException("No user found.");
                }
                res.status(200).json({ status: true, data: user });
            }));
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getUserFromToken = getUserFromToken;
function addAdminUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = new AdminModel_1.default(req.body);
            let userInsertion = yield AdminService.createUser(newUser);
            let savedUser = userInsertion.insertedId;
            console.log(savedUser);
            if (req.file) {
                const filePath = `adminimages/${userInsertion.insertedId}`;
                yield AdminService.uploadImageToFirebaseAndUpdateUser(req.file, filePath, savedUser);
                savedUser = yield AdminService.getUserById(savedUser); // Get updated user
            }
            res.status(201).json({ status: true, data: savedUser });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addAdminUser = addAdminUser;
function updateAdminUserDetails(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userDetails = req.body;
            if (!(0, AdminValidation_1.validateAdminUpdates)(userDetails)) {
                throw new HttpException_1.BadRequestException("Invalid data to update.");
            }
            const updatedUser = yield AdminService.updateUserDetails(id, userDetails, req.file);
            res.status(200).json({ status: true, data: updatedUser });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.updateAdminUserDetails = updateAdminUserDetails;
//# sourceMappingURL=AdminController.js.map