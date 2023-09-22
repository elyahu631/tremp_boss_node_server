import cron from 'node-cron';
import db from '../../utils/db';
import { getCurrentTimeInIsrael } from '../../services/TimeService';

let lastCheckedTime = getCurrentTimeInIsrael();


export const startTrempCronJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const currentTime = getCurrentTimeInIsrael();
      console.log(currentTime);
      console.log(lastCheckedTime);
      const upcomingTremps = await db.FindAll('Tremps', {
        deleted: false,
        tremp_time: {
          $gte: lastCheckedTime,
          $lte: new Date(currentTime.getTime() + 30 * 60 * 1000) // 30 minutes from now
        }
      });

      for (const tremp of upcomingTremps) {
        const driver = await db.FindByID('Users', tremp.creator_id.toString());

        if (driver && driver.first_name) {
          console.log(`Driver: ${driver.first_name} has a tremp scheduled for ${tremp.tremp_time}`);
        }
      }

      // Update the lastCheckedTime for the next cron run
      lastCheckedTime = currentTime;

    } catch (error) {
      console.error("Error running cron job:", error);
    }
  });
};


