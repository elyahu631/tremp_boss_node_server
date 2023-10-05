// resources/tremps/TrempCronJob.ts

import cron from 'node-cron';
import db from '../../utils/db';
import { getCurrentTimeInIsrael } from '../../services/TimeService';
import { sendNotificationToUser } from '../../services/sendNotification';

let lastCheckedTime = getCurrentTimeInIsrael();

export const startTrempCronJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const currentTime = getCurrentTimeInIsrael();
      const upcomingTremps = await db.FindAll('Tremps', {
        deleted: false,
        tremp_time: {
          $gte: lastCheckedTime,
          $lte: new Date(currentTime.getTime() + 30 * 60 * 1000)
        },
        "users_in_tremp": {
          "$elemMatch": {
            "is_approved": 'approved',
          }
        }
      });

      for (const tremp of upcomingTremps) {
        const driver = await db.FindByID('Users', tremp.creator_id.toString());

        if (driver && driver.first_name && driver.notification_token) {
          const trempTimeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });
          tremp.tremp_time.setHours(tremp.tremp_time.getHours() - 3);
          const trempTime = trempTimeFormatter.format(tremp.tremp_time);
          const title = `Upcoming Tremp!`;
          const body = `Hi ${driver.first_name}, you have a tremp scheduled for ${trempTime}.`;
          const data = { trempId: tremp._id.toString() };

          await sendNotificationToUser(driver.notification_token, title, body, data);
        }
      }

      // Update the lastCheckedTime for the next cron run
      lastCheckedTime = currentTime;

    } catch (error) {
      console.error("Error running cron job:", error);
    }
  });
};


