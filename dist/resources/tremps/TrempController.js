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
exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.createTremp = void 0;
const TrempService = __importStar(require("./TrempService"));
const UserService = __importStar(require("../users/UserService"));
const TrempModel_1 = __importDefault(require("./TrempModel"));
const admin = __importStar(require("firebase-admin"));
const environment_1 = require("../../config/environment");
admin.initializeApp({
    credential: admin.credential.cert({
        "projectId": environment_1.FIREBASE_ENV.project_id,
        "privateKey": environment_1.FIREBASE_ENV.private_key,
        "clientEmail": environment_1.FIREBASE_ENV.client_email,
    }),
    databaseURL: 'https://fcm.googleapis.com/fcm/send',
});
const validateTrempData = (tremp) => {
    tremp.validateTremp();
    const { creator_id, tremp_time, from_root, to_root } = tremp;
    if (!creator_id || !tremp_time || !from_root || !to_root) {
        throw new Error("Missing required tremp data");
    }
    if (new Date(tremp_time) < new Date()) {
        throw new Error("Tremp time has already passed");
    }
    if (from_root.name === to_root.name) {
        throw new Error("The 'from' and 'to' locations cannot be the same");
    }
};
function createTremp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newTremp = new TrempModel_1.default(req.body);
            validateTrempData(newTremp);
            const user = yield UserService.getUserById(newTremp.creator_id.toString());
            if (!user) {
                throw new Error("Creator user does not exist");
            }
            const result = yield TrempService.createTremp(newTremp);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: `Validation failed: ${error.message}` });
        }
    });
}
exports.createTremp = createTremp;
function getTrempsByFilters(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = req.body;
            const tremps = yield TrempService.getTrempsByFilters(filters);
            return res.status(200).json(tremps);
        }
        catch (error) {
            return res.status(500).json({ message: `Server error: ${error.message}` });
        }
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function addUserToTremp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tremp_id, user_id } = req.body;
            // validate user input
            if (!tremp_id || !user_id) {
                return res.status(400).json({ message: 'Tremp ID and User ID are required' });
            }
            const updatedTremp = yield TrempService.addUserToTremp(tremp_id, user_id);
            if (updatedTremp.matchedCount === 0) {
                return res.status(404).json({ message: 'Tremp not found' });
            }
            if (updatedTremp.modifiedCount === 0) {
                return res.status(400).json({ message: 'User not added to the tremp' });
            }
            // Get the creator ID of the tremp
            const tremp = yield TrempService.getTrempById(tremp_id);
            const creatorId = tremp.creator_id;
            // Get the creator's FCM token from the database
            const creator = yield UserService.getUserById(creatorId);
            const fcmToken = creator.notification_token;
            if (fcmToken) {
                // Send the notification to the creator
                yield sendNotificationToUser(fcmToken, tremp_id, user_id);
            }
            else {
                console.log('User does not have a valid FCM token');
            }
            return res.status(200).json({ message: 'User successfully added to the tremp' });
        }
        catch (error) {
            return res.status(500).json({ message: `Error adding user to Tremp: ${error.message}` });
        }
    });
}
exports.addUserToTremp = addUserToTremp;
function sendNotificationToUser(fcmToken, tremp_id, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            token: fcmToken,
            notification: {
                title: 'New User Joined Drive',
                body: 'A user has joined your drive.',
            },
            data: {
                tremp_id,
                user_id,
            },
        };
        yield admin.messaging().send(message);
    });
}
function approveUserInTremp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tremp_id, creator_id, user_id, approval } = req.body;
        try {
            yield TrempService.approveUserInTremp(tremp_id, creator_id, user_id, approval);
            return res.status(200).json({ message: 'User approval status updated successfully' });
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
}
exports.approveUserInTremp = approveUserInTremp;
//# sourceMappingURL=TrempController.js.map