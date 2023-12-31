"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimeInIsrael = void 0;
const date_fns_tz_1 = require("date-fns-tz");
function getCurrentTimeInIsrael() {
    const timeZone = 'Asia/Jerusalem';
    const nowUtc = new Date();
    // Get the timezone offset in milliseconds
    const timezoneOffsetMs = (0, date_fns_tz_1.getTimezoneOffset)(timeZone, nowUtc);
    // Subtract the offset from the current UTC time
    const adjustedUtc = new Date(nowUtc.getTime() + timezoneOffsetMs);
    // Return adjusted Date
    return adjustedUtc;
}
exports.getCurrentTimeInIsrael = getCurrentTimeInIsrael;
//# sourceMappingURL=TimeService.js.map