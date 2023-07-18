// src/resources/kpis/KpiDataAccess.ts

import { ObjectId } from "mongodb";
import DB from "../../utils/db";
const db = new DB();
class KpiDataAccess {
  static trempCollection = 'Tremps';
  static UserCollection = 'Users';

  async getTotalTremps() {
    const rideRequests = await db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'hitchhiker' });
    const ApprovedRequests = await db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'hitchhiker', 'users_in_tremp.is_approved': 'approved', 'deleted': false });
    const rideOffers = await db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'driver' });
    const approvedOffers = await db.CountCollection(KpiDataAccess.trempCollection, { tremp_type: 'driver', 'users_in_tremp.is_approved': 'approved', 'deleted': false });
    const allApprovedTremps = await db.CountCollection(KpiDataAccess.trempCollection, { 'users_in_tremp.is_approved': 'approved', 'deleted': false });

    return {
      rideRequests,
      ApprovedRequests,
      rideOffers,
      approvedOffers,
      allApprovedTremps
    };
  }

  async getTotalTrempsByGender() {
    const pipeline = [
      {
        $match: {
          'users_in_tremp.is_approved': 'approved',
          'deleted': false
        }
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'creator_id',
          foreignField: '_id',
          as: 'creator_details'
        }
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'users_in_tremp.user_id',
          foreignField: '_id',
          as: 'users_in_tremp_details'
        }
      },
      {
        $project: {
          users: {
            $concatArrays: ['$creator_details', '$users_in_tremp_details']
          }
        }
      },
      {
        $unwind: '$users'
      },
      {
        $group: {
          _id: '$users.gender',
          count: { $sum: 1 }
        }
      }
    ];
    
    
    
    const result = await db.aggregate(KpiDataAccess.trempCollection, pipeline);
    

    const genderStats = result.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, { M: 0, F: 0 });

    return genderStats;
  }

}

export default KpiDataAccess;
