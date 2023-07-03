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
exports.updateAdminUserDetails = exports.markAdminUserAsDeleted = exports.getAllAdminUsers = exports.addAdminUser = exports.deleteAdminUserById = exports.getAdminUserById = exports.loginAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../config/environment");
const AdminService = __importStar(require("./AdminService"));
const AdminModel_1 = __importDefault(require("./AdminModel"));
const AdminValidation_1 = require("./AdminValidation");
function loginAdmin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        const user = yield AdminService.loginUser(username, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, environment_1.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ user, token });
    });
}
exports.loginAdmin = loginAdmin;
function getAdminUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = yield AdminService.getUserById(id);
            return res.status(200).json(user);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getAdminUserById = getAdminUserById;
function deleteAdminUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield AdminService.deleteUserById(id);
            return res.status(200).json({ message: "User successfully deleted" });
        }
        catch (error) {
            throw error;
        }
    });
}
exports.deleteAdminUserById = deleteAdminUserById;
function addAdminUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = yield AdminService.createUser(new AdminModel_1.default(req.body));
            return res.status(201).json(newUser);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.addAdminUser = addAdminUser;
function getAllAdminUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield AdminService.getAllUsers();
            return res.status(200).json(users);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getAllAdminUsers = getAllAdminUsers;
function markAdminUserAsDeleted(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield AdminService.markUserAsDeleted(id);
            return res.status(200).json({ message: "User deletion status successfully updated" });
        }
        catch (error) {
            throw error;
        }
    });
}
exports.markAdminUserAsDeleted = markAdminUserAsDeleted;
function updateAdminUserDetails(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const userDetails = req.body;
            if (!(0, AdminValidation_1.validateAdminUpdates)(userDetails)) {
                return res.status(401).json({ error: 'Invalid data to update.' });
            }
            const updatedUser = yield AdminService.updateUserDetails(id, userDetails);
            return res.status(200).json([updatedUser, { message: "User updated successfully" }]);
        }
        catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.updateAdminUserDetails = updateAdminUserDetails;
//# sourceMappingURL=AdminControler.js.map