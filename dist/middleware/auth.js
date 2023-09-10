"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdminToken = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const verifyToken = (token, res, callback) => {
    if (!token) {
        return res.sendStatus(401);
    }
    jsonwebtoken_1.default.verify(token, environment_1.JWT_SECRET, (err, user) => {
        if (err || !user) {
            return res.sendStatus(403);
        }
        callback(user);
    });
};
// Middleware function to authenticate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    verifyToken(token, res, (user) => {
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    verifyToken(token, res, (user) => {
        if (user.rule !== 'admin') {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};
exports.authenticateAdminToken = authenticateAdminToken;
//# sourceMappingURL=auth.js.map