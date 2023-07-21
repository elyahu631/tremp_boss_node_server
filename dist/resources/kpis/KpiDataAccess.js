"use strict";
// src/resources/kpis/KpiDataAccess.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../../utils/db"));
const TimeService_1 = require("../../services/TimeService");
const db = new db_1.default();
class KpiDataAccess {
    getTotalTremps() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $facet: {
                        rideRequests: [
                            { $match: { tremp_type: 'hitchhiker' } },
                            { $count: 'count' }
                        ],
                        ApprovedRequests: [
                            { $match: { tremp_type: 'hitchhiker', 'users_in_tremp.is_approved': 'approved', 'deleted': false } },
                            { $count: 'count' }
                        ],
                        rideOffers: [
                            { $match: { tremp_type: 'driver' } },
                            { $count: 'count' }
                        ],
                        approvedOffers: [
                            { $match: { tremp_type: 'driver', 'users_in_tremp.is_approved': 'approved', 'deleted': false } },
                            { $count: 'count' }
                        ],
                    }
                }
            ];
            const result = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            ;
            return {
                rideRequests: ((_a = result[0].rideRequests[0]) === null || _a === void 0 ? void 0 : _a.count) || 0,
                ApprovedRequests: ((_b = result[0].ApprovedRequests[0]) === null || _b === void 0 ? void 0 : _b.count) || 0,
                rideOffers: ((_c = result[0].rideOffers[0]) === null || _c === void 0 ? void 0 : _c.count) || 0,
                approvedOffers: ((_d = result[0].approvedOffers[0]) === null || _d === void 0 ? void 0 : _d.count) || 0,
            };
        });
    }
    getPeopleAndTrempCounts() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        average_people_per_trip: { $cond: { if: { $eq: ["$total_approved_trips", 0] }, then: 0, else: { $divide: ["$total_people", "$total_approved_trips"] } } }
                    }
                }
            ];
            const result = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return result;
        });
    }
    getTotalTrempsByGender() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const result = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            const genderStats = result.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, { M: 0, F: 0 });
            return genderStats;
        });
    }
    getTotalTrempsByGenderByMonth() {
        return __awaiter(this, void 0, void 0, function* () {
            const fourMonthsAgo = (0, TimeService_1.getCurrentTimeInIsrael)();
            fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
            const pipeline = [
                {
                    $match: {
                        'users_in_tremp.is_approved': 'approved',
                        'deleted': false,
                        'tremp_time': { $gte: fourMonthsAgo },
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'creator_id',
                        foreignField: '_id',
                        as: 'creator_details'
                    }
                },
                {
                    $unwind: "$creator_details"
                },
                {
                    $project: {
                        month: { $month: "$tremp_time" },
                        year: { $year: "$tremp_time" },
                        gender: "$creator_details.gender"
                    }
                },
                {
                    $group: {
                        _id: {
                            month: "$month",
                            year: "$year",
                            gender: "$gender"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: {
                            month: "$_id.month",
                            year: "$_id.year"
                        },
                        genders: {
                            $push: {
                                gender: "$_id.gender",
                                count: "$count"
                            }
                        }
                    },
                },
            ];
            const dbResult = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            const dbResultMap = dbResult.reduce((acc, curr) => {
                const monthYearKey = `${curr._id.month}-${curr._id.year}`;
                acc[monthYearKey] = curr.genders;
                return acc;
            }, {});
            const lastFourMonths = this.getLastFourMonths();
            const finalResult = lastFourMonths.map(monthYear => {
                const monthYearKey = `${monthYear.month}-${monthYear.year}`;
                const genders = dbResultMap[monthYearKey] || [{ gender: 'M', count: 0 }, { gender: 'F', count: 0 }];
                return Object.assign(Object.assign({}, monthYear), { genders });
            });
            return finalResult;
        });
    }
    getLastFourMonths() {
        const date = (0, TimeService_1.getCurrentTimeInIsrael)();
        const months = [];
        for (let i = 0; i < 4; i++) {
            months.push({
                month: date.getMonth() + 1,
                year: date.getFullYear()
            });
            date.setMonth(date.getMonth() - 1);
        }
        return months;
    }
    getLastOpenedTrips() {
        return __awaiter(this, void 0, void 0, function* () {
            const pipeline = [
                {
                    $match: {
                        'deleted': false
                    }
                },
                {
                    $lookup: {
                        from: KpiDataAccess.UserCollection,
                        localField: 'creator_id',
                        foreignField: '_id',
                        as: 'creator_data'
                    }
                },
                {
                    $unwind: "$creator_data" // Deconstructs an array field to output a document for each element.
                },
                {
                    $sort: { 'create_date': -1 } // Sort by date descending, latest first
                },
                {
                    $limit: 5 // Get only the last 5 documents
                },
                {
                    $project: {
                        creator_name: { $concat: ['$creator_data.first_name', ' ', '$creator_data.last_name'] },
                        from_route: '$from_root.name',
                        to_root: '$to_root.name',
                        time: '$tremp_time'
                    }
                }
            ];
            const trips = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return trips;
        });
    }
    getMostPopularRoutes() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const popularRoutes = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return popularRoutes;
        });
    }
    getTopDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const drivers = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            return drivers;
        });
    }
    getMostRequestedHours() {
        return __awaiter(this, void 0, void 0, function* () {
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
            let hours = yield db.aggregate(KpiDataAccess.trempCollection, pipeline);
            hours = hours.map(hour => (Object.assign(Object.assign({}, hour), { _id: hour._id + ':00' })));
            return hours;
        });
    }
}
KpiDataAccess.trempCollection = 'Tremps';
KpiDataAccess.UserCollection = 'Users';
exports.default = KpiDataAccess;
//# sourceMappingURL=KpiDataAccess.js.map