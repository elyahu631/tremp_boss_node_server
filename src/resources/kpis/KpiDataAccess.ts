// src/resources/kpis/KpiDataAccess.ts

import db from "../../utils/db";
class KpiDataAccess {
  static trempCollection = 'Tremps';
  static UserCollection = 'Users';
  static GroupCollection = 'Groups';
  static usersGroupCollection = 'UserGroups'

  private static _createDateFilter(startDate?: string, endDate?: string): { $gte?: Date, $lte?: Date } {
    let dateFilter: { $gte?: Date, $lte?: Date } = {};
    if (startDate) {
      dateFilter['$gte'] = new Date(startDate);
    }
    if (endDate) {
      dateFilter['$lte'] = new Date(endDate);
    }
    return dateFilter;
  }

  async getPeopleAndTrempCounts(startDate?: string, endDate?: string,trempType?:string) {

    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);

    
    
    const pipeline = [

      // Documents marked as 'deleted' are filtered out in the 'match' stage.
      {
        $match: {
          deleted: false,
          ...(trempType && trempType.length > 4 ? { tremp_type: trempType } : {}),
          ...(Object.keys(dateFilter).length ? { tremp_time: dateFilter } : {})
        }

      },

      // New fields are added to each document in the 'addFields' stage.
      // 'approved_users_count' is the count of approved users in the trip.
      // 'is_approved_trip' indicates if the trip is approved or not.
      {
        $addFields: {
          approved_users_count: {
            $size: {
              $filter: {
                input: "$users_in_tremp",
                as: "user",
                cond: { $eq: ["$$user.is_approved", "approved"] }
              }
            }
          },
          is_approved_trip: { $in: ["approved", "$users_in_tremp.is_approved"] }
        }
      },

      // The 'project' stage controls the fields that are included in the output.
      // 'total_people' represents the total number of people (the count of approved users plus one).
      // It also keeps the 'is_approved_trip' field.
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

      // The 'group' stage groups the documents. In this case, all documents are grouped together (_id: 1).
      // It sums up the 'total_people' and 'total_approved_trips'.
      {
        $group: {
          _id: 1,
          total_people: { $sum: "$total_people" },
          total_approved_trips: { $sum: { $cond: { if: "$is_approved_trip", then: 1, else: 0 } } }
        }
      },

      // Another 'project' stage is used to modify the structure of the result.
      // It calculates 'average_people_per_trip' which is the ratio of total people to the total approved trips.
      {
        $project: {
          total_people: 1,
          total_approved_trips: 1,
          average_people_per_trip: {
            $cond: {
              if: { $eq: ["$total_approved_trips", 0] },
              then: 0,
              else: { $divide: ["$total_people", "$total_approved_trips"] }
            }
          }
        }
      }
    ];
    const result = await db.aggregate(KpiDataAccess.trempCollection, pipeline);

    return result;
  }

  async getMostPopularRoutes(startDate?: string, endDate?: string,trempType?:string) {
    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);

    const pipeline = [
      {
        $match: {
          deleted: false,
          ...(trempType && trempType.length > 4 ? { tremp_type: trempType } : {}),
          ...(Object.keys(dateFilter).length ? { tremp_time: dateFilter } : {})
        },
      },
      {
        $group: {
          _id: { from_route: "$from_route.name", to_route: "$to_route.name" },
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

  async getTopDrivers(startDate?: string, endDate?: string,trempType?:string) {

    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);

    const pipeline = [
      {
        $match: {
          'deleted': false,
          ...(trempType && trempType.length > 4 ? { tremp_type: trempType } : {}),
          ...(Object.keys(dateFilter).length ? { tremp_time: dateFilter } : {})

        }
      },
      {
        $facet: {
          drivers: [
            {
              $match: {
                'tremp_type': 'driver',
                'users_in_tremp.is_approved': 'approved'
              }
            },
            {
              $group: {
                _id: "$creator_id",
                count: { $sum: 1 }
              }
            }
          ],
          hitchhikers: [
            {
              $match: {
                'tremp_type': 'hitchhiker',
                'users_in_tremp.is_approved': 'approved'
              }
            },
            {
              $unwind: "$users_in_tremp"
            },
            {
              $match: {
                'users_in_tremp.is_approved': 'approved'
              }
            },
            {
              $group: {
                _id: "$users_in_tremp.user_id",
                count: { $sum: 1 }
              }
            }
          ]
        }
      },
      {
        $project: {
          combined: { $concatArrays: ["$drivers", "$hitchhikers"] }
        }
      },
      {
        $unwind: "$combined"
      },
      {
        $replaceRoot: { newRoot: "$combined" }
      },
      {
        $lookup: {
          from: KpiDataAccess.UserCollection,
          localField: '_id',
          foreignField: '_id',
          as: 'driver_data'
        }
      },
      {
        $unwind: '$driver_data'
      },
      {
        $group: {
          _id: "$_id",
          driverName: { $first: { $concat: ['$driver_data.first_name', '-', '$driver_data.last_name'] } },
          driverEmail: { $first: "$driver_data.email" },
          count: { $sum: "$count" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ];

    const drivers = await db.aggregate(KpiDataAccess.trempCollection, pipeline);
    return drivers;
  }

  async getMostRequestedHours(startDate?: string, endDate?: string,trempType?:string) {

    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);

    const pipeline = [
      {
        $match: {
          deleted: false,
          ...(trempType && trempType.length > 4 ? { tremp_type: trempType } : {}),
          ...(Object.keys(dateFilter).length ? { tremp_time: dateFilter } : {})
        },
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

  async getRideAndTripCounts(startDate?: string, endDate?: string,trempType?:string) {
    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);

    const pipeline = [
      {
        $match: {
          deleted: false,
          ...(trempType && trempType.length > 4 ? { tremp_type: trempType } : {}),
          ...(Object.keys(dateFilter).length ? { tremp_time: dateFilter } : {})
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

  async getHitchhikerMonthlyCountsByGender(startDate?: string, endDate?: string,trempType?:string) {

    const corentDate = new Date();

    if (!endDate) {
      endDate = corentDate.toISOString();
    }

    // If startDate is not provided, default to six months ago.
    if (!startDate) {
      corentDate.setMonth(corentDate.getMonth() - 6);
      startDate = corentDate.toISOString();
    }


    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);


    const creatorsPipeline = [
      {
        $match: {
          "tremp_time": dateFilter,
          "deleted": false,
          ...(trempType && trempType.length > 4 ? { tremp_type: trempType } : {}),

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
          "tremp_time": { $gte: dateFilter },
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

  async getInactiveGroups() {
    // 1. Groups with less than 3 users
    const userGroupPipeline = [
      { $group: { _id: "$group_id", count: { $sum: 1 } } },
      { $match: { count: { $lt: 3 } } },
      { $project: { group_id: "$_id", _id: 0 } }
    ];
    const smallGroups = await db.aggregate(KpiDataAccess.usersGroupCollection, userGroupPipeline);

    // 2. Groups with no tremps in the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const trempPipeline = [
      { $match: { create_date: { $gte: oneMonthAgo } } },
      { $group: { _id: "$group_id" } },
      { $project: { group_id: "$_id", _id: 0 } }
    ];
    const activeTrempGroups = await db.aggregate(KpiDataAccess.trempCollection, trempPipeline);

    // 3. Merge the lists
    const allGroups = await db.FindAll(KpiDataAccess.GroupCollection, {});
    const inactiveGroupIds = [...smallGroups, ...activeTrempGroups].map(g => g.group_id.toString());

    return allGroups.filter(group => !inactiveGroupIds.includes(group._id.toString()));
  }

  async getMostActiveGroups(startDate?: string, endDate?: string,trempType?:string) {

    const dateFilter = KpiDataAccess._createDateFilter(startDate, endDate);

    const pipeline = [
      {
        $match: {
          active: "active",
          deleted: false,
        },
      },
      {
        $lookup: {
          from: KpiDataAccess.trempCollection,
          localField: "_id",
          foreignField: "group_id",
          as: "group_tremps",
        },
      },
      {
        $lookup: {
          from: KpiDataAccess.usersGroupCollection,
          localField: "_id",
          foreignField: "group_id",
          as: "group_users",
        },
      },
      {
        $addFields: {
          approved_users: {
            $filter: {
              input: "$group_users",
              as: "user",
              cond: { $eq: ["$$user.is_approved", "approved"] },
            },
          },
        },
      },
      {
        $project: {
          group_name: 1,
          tremp_count: { $size: "$group_tremps" },
          user_count: { $size: "$approved_users" },
        },
      },
      {
        $addFields: {
          total_activity: {
            $add: ["$tremp_count", "$user_count"],
          },
        },
      },
      {
        $match: {
          $or: [
            { tremp_count: { $gte: 1 } }, // Groups with at least one ride
            { user_count: { $gte: 2 } }, // Groups with at least two users
          ],
        },
      },
      {
        $sort: { total_activity: -1 },
      },
      {
        $limit: 5,
      },
    ];


    const activeGroups = await db.aggregate(KpiDataAccess.GroupCollection, pipeline);
    activeGroups[0].user_count = (await db.FindAll(KpiDataAccess.UserCollection, { deleted: false, status: "active" })).length
    return activeGroups;
  }

}



export default KpiDataAccess;

