import cron from 'node-cron';
import db from '../../utils/db';

let lastCheckedTime = new Date();


export const startTrempCronJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      console.log("Cron job triggered");

      const currentTime = new Date();

      const upcomingTremps = await db.FindAll('tremps', {
        deleted:false,
        tremp_time: {
          $gte: lastCheckedTime,
          $lte: new Date(currentTime.getTime() + 30 * 60 * 1000) // 30 minutes from now
        }
      });

      for (const tremp of upcomingTremps) {
        const driver = await db.FindByID('users', tremp.creator_id.toString());

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


