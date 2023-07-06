// src/timeUtils/index.ts

import { utcToZonedTime, format } from 'date-fns-tz';

export function getCurrentTimeInIsrael(): string {
  const timeZone = 'Asia/Jerusalem';
  const loginDate = new Date();

  // Convert the date in that timezone
  const zonedDate = utcToZonedTime(loginDate, timeZone);
  const loginDateISOString = format(zonedDate, 'yyyy-MM-dd\'T\'HH:mm:ssXXX', { timeZone });

  return loginDateISOString;
}
