// src/timeUtils/index.ts

import { utcToZonedTime ,getTimezoneOffset   } from 'date-fns-tz';

export function getCurrentTimeInIsrael(): Date {
  const timeZone = 'Asia/Jerusalem';
  const nowUtc = new Date();

  // Convert UTC to Israel time
  const nowInIsrael = utcToZonedTime(nowUtc, timeZone);

  // Get the timezone offset in milliseconds
  const timezoneOffsetMs = getTimezoneOffset(timeZone, nowUtc);

  // Subtract the offset from the current UTC time
  const adjustedUtc = new Date(nowUtc.getTime() + timezoneOffsetMs);
    // Return adjusted Date
  return adjustedUtc;
}