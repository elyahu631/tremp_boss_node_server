// src/resources/kpis/KpiDataAccess.ts

import { ObjectId, AggregationCursor } from "mongodb";
import DB from "../../utils/db";
import { getCurrentTimeInIsrael } from "../../services/TimeService";
const db = new DB();
class KpiDataAccess {
  static trempCollection = 'Tremps';
  static UserCollection = 'Users';

 
  async getPeopleAndTrempCounts() {
    const pipeline = [
      {
        $match: {
          deleted: false
        }
      },
      {
        $addFields: {
          approved_users_count: { $size: { $filter: { input: "$users_in_tremp", as: "user", cond: { $eq: ["$$user.is_approved", "approved"] } } } },
          is_approved_trip: { $in: ["approved", "$users_in_tremp.is_approved"] }
        }
      },
      {
        $project: {
          total_people: {
            $cond: { 
              if: { $gt: ["$approved_users_count", 0] },
              then: { $add: [1, "$approved_users_count"] },
              else: "$approved_users_count"
            }
          },
          is_approved_trip: 1
        }
      },
      {
        $group: {
          _id: 1,
          total_people: { $sum: "$total_people" },
          total_approved_trips: { $sum: { $cond: { if: "$is_approved_trip", then: 1, else: 0 } } }
        }
      },
      {
        $project: {
          total_people: 1,
          total_approved_trips: 1,
          average_people_per_trip: { $cond: { if: { $eq: [ "$total_approved_trips", 0 ] }, then: 0, else: { $divide: [ "$total_people", "$total_approved_trips" ] } } }
        }
      }
    ];

    const result = await db.aggregate(KpiDataAccess.trempCollection, pipeline);

    return result;
  }

  async getMostPopularRoutes() {
    const pipeline = [
      {
        $group: {
          _id: { from_root: "$from_root.name", to_root: "$to_root.name" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ];

    const popularRoutes = await db.aggregate(KpiDataAccess.trempCollection, pipeline);
    return popularRoutes;
  }

  async getTopDrivers() {
    const pipeline = [
      {
        $match: {
          'users_in_tremp.is_approved': 'approved',
          'deleted': false,
          'tremp_type': 'driver'
        }
      },
      {
        $lookup: {
          from: KpiDataAccess.UserCollection,
          localField: 'creator_id',
          foreignField: '_id',
          as: 'driver_data'
        }
      },
      {
        $unwind: '$driver_data'
      },
      {
        $group: {
          _id: "$creator_id",
          driverName: { $first: { $concat: ['$driver_data.first_name', '-', '$driver_data.last_name'] } },
          driverEmail: { $first: "$driver_data.user_email" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
    ];

    const drivers = await db.aggregate(KpiDataAccess.trempCollection, pipeline);
    return drivers;
  }

  async getMostRequestedHours() {
    const pipeline = [
      {
        $match: {
          'deleted': false,
        }
      },
      {
        $addFields: {
          convertedTrempTime: {
            $toDate: "$tremp_time"
          }
        }
      },
      {
        $project: {
          hour: { $hour: "$convertedTrempTime" }
        }
      },
      {
        $group: {
          _id: "$hour",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
    ];

    let hours = await db.aggregate(KpiDataAccess.trempCollection, pipeline);
    hours = hours.map(hour => ({
      ...hour,
      _id: hour._id + ':00',
    }));

    return hours;
  }

  async getRideAndTripCounts() {
    const pipeline = [
      {
        $match: {
          deleted: false
        }
      },
      {
        $addFields: {
          openRides: { $cond: [{ $eq: ["$tremp_type", "driver"] }, 1, 0] },
          joinedRides: {
            $cond: [
              {
                $and: [
                  { $eq: ["$tremp_type", "driver"] },
                  { $ne: [{ $size: "$users_in_tremp" }, 0] }
                ]
              },
              { $size: "$users_in_tremp" },
              0
            ]
          },
          openTrips: { $cond: [{ $eq: ["$tremp_type", "hitchhiker"] }, 1, 0] },
          joinedTrips: {
            $cond: [
              {
                $and: [
                  { $eq: ["$tremp_type", "hitchhiker"] },
                  { $ne: [{ $size: "$users_in_tremp" }, 0] }
                ]
              },
              { $size: "$users_in_tremp" },
              0
            ]
          },
        }
      },
      {
        $group: {
          _id: 1,
          totalOpenRides: { $sum: "$openRides" },
          totalJoinedRides: { $sum: "$joinedRides" },
          totalOpenTrips: { $sum: "$openTrips" },
          totalJoinedTrips: { $sum: "$joinedTrips" },
        }
      },
    ];
    

    const result = await db.aggregate(KpiDataAccess.trempCollection, pipeline);
    return result;
  }
  
  async getHitchhikerMonthlyCountsByGender() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const creatorsPipeline = [
      {
        $match: {
          "create_date": { $gte: sixMonthsAgo },
          "deleted": false
        }
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'creator_id',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$create_date" },
            gender: "$creator.gender"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.month": 1
        }
      }
    ];

    const passengersPipeline = [
      {
        $match: {
          "create_date": { $gte: sixMonthsAgo },
          "users_in_tremp.is_approved": 'approved',
          "deleted": false
        }
      },
      {
        $unwind: '$users_in_tremp'
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'users_in_tremp.user_id',
          foreignField: '_id',
          as: 'passenger'
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$create_date" },
            gender: "$passenger.gender"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.month": 1
        }
      }
    ];

    const [creatorsResult, passengersResult] = await Promise.all([
      await db.aggregate(KpiDataAccess.trempCollection, creatorsPipeline),
      await db.aggregate(KpiDataAccess.trempCollection, passengersPipeline)
    ]);

    return {
      creators_by_month_and_gender: creatorsResult,
      passengers_by_month_and_gender: passengersResult
    };
  }

}



export default KpiDataAccess;

