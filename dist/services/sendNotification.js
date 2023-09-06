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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationToUser = void 0;
// src/services/sendNotification.ts
const admin = __importStar(require("firebase-admin"));
const environment_1 = require("../config/environment");
/**
 * Initializes the Firebase Admin SDK to interact with Firebase services.
 */
admin.initializeApp({
    credential: admin.credential.cert({
        "projectId": environment_1.FIREBASE_ENV.project_id,
        "privateKey": environment_1.FIREBASE_ENV.private_key,
        "clientEmail": environment_1.FIREBASE_ENV.client_email,
    }),
    databaseURL: 'https://fcm.googleapis.com/fcm/send',
});
/**
 * Sends a push notification to a specific user device using Firebase Cloud Messaging (FCM).
 *
 * @param {string} fcmToken - The unique token for the user's device.
 * @param {string} title - The title that will be shown to the user.
 * @param {string} body - The main content or message body of the notification.
 * @param {object} [data={}] - Optional data payload that can be sent with the notification.
 *
 * @example
 * sendNotificationToUser(
 *   "user_device_token_here",
 *   "Welcome to Our App!",
 *   "You have a new message.",
 *   { messageID: "12345" }
 * );
 */
function sendNotificationToUser(fcmToken, title, body, data = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            token: fcmToken,
            notification: {
                title: title,
                body: body,
            },
            data: Object.assign({}, data),
        };
        yield admin.messaging().send(message);
    });
}
exports.sendNotificationToUser = sendNotificationToUser;
//# sourceMappingURL=sendNotification.js.map