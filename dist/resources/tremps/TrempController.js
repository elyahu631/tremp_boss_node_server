"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.getApprovedTremps = exports.deleteTremp = exports.getUsersInTremp = exports.getUserTremps = exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.getAllTremps = exports.createTremp = void 0;
const TrempService = __importStar(require("./TrempService"));
const UserService = __importStar(require("../users/UserService"));
const TrempModel_1 = __importDefault(require("./TrempModel"));
const HttpException_1 = require("../../middleware/HttpException");
const sendNotification_1 = require("../../services/sendNotification");
function createTremp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newTremp = new TrempModel_1.default(req.body);
            const result = yield TrempService.createTremp(newTremp);
            res.status(200).json({ status: true, data: result });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.createTremp = createTremp;
function getAllTremps(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let trepms = yield TrempService.getAllTremps();
            trepms = trepms.map(tremp => (Object.assign(Object.assign({}, tremp), { password: "user1234" })));
            res.status(200).json({ status: true, data: trepms });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getAllTremps = getAllTremps;
function getTrempsByFilters(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = req.body;
            const tremps = yield TrempService.getTrempsByFilters(filters);
            res.status(200).json({ status: true, data: tremps });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function addUserToTremp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tremp_id, user_id } = req.body;
            if (!tremp_id || !user_id) {
                throw new HttpException_1.BadRequestException('Tremp ID and User ID are required');
            }
            yield TrempService.addUserToTremp(tremp_id, user_id);
            res.status(200).json({ status: true, message: 'User successfully added to the tremp' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addUserToTremp = addUserToTremp;
function approveUserInTremp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tremp_id, creator_id, user_id, approval } = req.body;
            yield TrempService.approveUserInTremp(tremp_id, creator_id, user_id, approval);
            if (approval !== "approved" && approval !== "denied") {
                throw new HttpException_1.BadRequestException('invalid approval');
            }
            const user_in_tremp = yield UserService.getUserById(user_id);
            const fcmToken = user_in_tremp.notification_token;
            if (fcmToken) {
                yield (0, sendNotification_1.sendNotificationToUser)(fcmToken, `The creator ${approval}`, `The creator of the ride ${approval} your request`, { creator_id, tremp_id, user_id });
            }
            else {
                console.log('User does not have a valid FCM token');
            }
            res.status(200).json({ status: true, message: 'User approval status updated successfully' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.approveUserInTremp = approveUserInTremp;
function getUserTremps(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_id, tremp_type } = req.body;
            if (!user_id || !tremp_type) {
                throw new HttpException_1.BadRequestException('User ID and type of ride are required');
            }
            const tremps = yield TrempService.getUserTremps(user_id, tremp_type);
            if (!tremps) {
                throw new HttpException_1.NotFoundException("No Tremps found for this user and ride type");
            }
            res.status(200).json({ status: true, data: tremps });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getUserTremps = getUserTremps;
function getUsersInTremp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const trempId = req.params.tremp_id;
            const users = yield TrempService.getUsersInTremp(trempId);
            res.status(200).json({ status: true, data: users });
        }
        catch (error) {
            next(error);
        }
    });
}
exports.getUsersInTremp = getUsersInTremp;
;
function deleteTremp(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tremp_id, user_id } = req.body;
            if (!tremp_id || !user_id) {
                throw new HttpException_1.BadRequestException('Tremp ID and User ID are required');
            }
            const result = yield TrempService.deleteTremp(tremp_id, user_id);
            res.status(200).json({ status: true, message: 'Tremp successfully deleted' });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.deleteTremp = deleteTremp;
function getApprovedTremps(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { user_id, tremp_type } = req.body;
            if (!user_id || !tremp_type) {
                throw new HttpException_1.BadRequestException('User ID and type of ride are required');
            }
            const approvedTremps = yield TrempService.getApprovedTremps(user_id, tremp_type);
            if (!approvedTremps) {
                throw new HttpException_1.NotFoundException("No Tremps found for this user and ride type");
            }
            res.status(200).json({ status: true, data: { approved_tremps: approvedTremps } });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getApprovedTremps = getApprovedTremps;
//# sourceMappingURL=TrempController.js.map