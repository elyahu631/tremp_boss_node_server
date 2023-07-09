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
exports.AdminAddUser = exports.markUserAsDeleted = exports.getAllUsers = exports.addUser = exports.updateUser = exports.deleteUserById = exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../../config/environment");
const UserService = __importStar(require("./UserService"));
const UserValidation_1 = require("./UserValidation");
const UserModel_1 = __importDefault(require("./UserModel"));
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_email, password } = req.body;
            const result = yield UserService.registerUser(user_email, password);
            if (!result) {
                return res.status(500).json({ message: "Failed to register user" });
            }
            return res.status(201).json({ message: "User registered successfully" });
        }
        catch (error) {
            throw error;
        }
    });
}
exports.registerUser = registerUser;
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user_email, password } = req.body;
        const user = yield UserService.loginUser(user_email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, environment_1.JWT_SECRET, { expiresIn: '6h' });
        return res.status(200).json({ user, token });
    });
}
exports.loginUser = loginUser;
function getUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const user = yield UserService.getUserById(id);
            return res.status(200).json(user);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getUserById = getUserById;
function deleteUserById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield UserService.deleteUserById(id);
            return res.status(200).json({ message: "User successfully deleted" });
        }
        catch (error) {
            throw error;
        }
    });
}
exports.deleteUserById = deleteUserById;
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const updatedUser = req.body;
            if (!(0, UserValidation_1.validateUpdatedUser)(updatedUser)) {
                return res.status(401).json({ error: 'Invalid data to update.' });
            }
            yield UserService.updateUser(id, updatedUser);
            return res.status(200).json({ message: "User updated successfully" });
        }
        catch (error) {
        }
    });
}
exports.updateUser = updateUser;
function addUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_email, password } = req.body;
            const result = yield UserService.addUser(user_email, password);
            return res.status(201).json(result);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.addUser = addUser;
function getAllUsers(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield UserService.getAllUsers();
            return res.status(200).json(users);
        }
        catch (error) {
            throw error;
        }
    });
}
exports.getAllUsers = getAllUsers;
function markUserAsDeleted(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield UserService.markUserAsDeleted(id);
            return res
                .status(200)
                .json({ message: "User deletion status successfully updated" });
        }
        catch (error) {
            throw error;
        }
    });
}
exports.markUserAsDeleted = markUserAsDeleted;
function AdminAddUser(req, res) {
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
            return res.status(201).json(savedUser);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }
    });
}
exports.AdminAddUser = AdminAddUser;
//# sourceMappingURL=UserController.js.map