// src/services/sendNotification.ts
import * as admin from 'firebase-admin';
import { FIREBASE_ENV } from "../config/environment";

/**
 * Initializes the Firebase Admin SDK to interact with Firebase services. 
 */
admin.initializeApp({
  credential: admin.credential.cert({
    "projectId": FIREBASE_ENV.project_id,
    "privateKey": FIREBASE_ENV.private_key,
    "clientEmail": FIREBASE_ENV.client_email,
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
export async function sendNotificationToUser(fcmToken: string, title: string, body: string, data: object = {}) {
  const message = {
    token: fcmToken,
    notification: {
      title: title,
      body: body,
    },
    data: {
      ...data, 
    },
  };
  await admin.messaging().send(message);
}
