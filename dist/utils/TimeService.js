"use strict";
// src/timeUtils/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimeInIsrael = void 0;
const date_fns_tz_1 = require("date-fns-tz");
function getCurrentTimeInIsrael() {
    const timeZone = 'Asia/Jerusalem';
    const loginDate = new Date();
    // Convert the date in that timezone
    const zonedDate = (0, date_fns_tz_1.utcToZonedTime)(loginDate, timeZone);
    const loginDateISOString = (0, date_fns_tz_1.format)(zonedDate, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone });
    return loginDateISOString;
}
exports.getCurrentTimeInIsrael = getCurrentTimeInIsrael;
//# sourceMappingURL=TimeService.js.map