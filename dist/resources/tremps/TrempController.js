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
exports.approveUserInTremp = exports.addUserToTremp = exports.getTrempsByFilters = exports.createTremp = void 0;
const TrempService = __importStar(require("./TrempService"));
const UserService = __importStar(require("../users/UserService"));
const TrempModel_1 = __importDefault(require("./TrempModel"));
function createTremp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tremp = req.body;
        const newTremp = new TrempModel_1.default(tremp);
        // Validate tremp before further processing
        try {
            newTremp.validateTremp();
        }
        catch (error) {
            return res.status(400).json({ message: `Validation failed: ${error.message}` });
        }
        const { creator_id, tremp_time, from_root, to_root } = newTremp;
        try {
            // Check if the user exists
            const user = yield UserService.getUserById(creator_id.toString());
            console.log(user);
            if (!user) {
                throw new Error("Creator user does not exist");
            }
            // Check if tremp_time has not passed
            if (new Date(tremp_time) < new Date()) {
                throw new Error("Tremp time has already passed");
            }
            // Check if 'from' and 'to' locations are not the same
            if (from_root.name === to_root.name) {
                throw new Error("The 'from' and 'to' locations cannot be the same");
            }
            const result = yield TrempService.createTremp(newTremp);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
}
exports.createTremp = createTremp;
function getTrempsByFilters(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = req.body;
            const tremps = yield TrempService.getTrempsByFilters(filters);
            return res.status(200).json(tremps);
        }
        catch (error) {
            return res.status(500).json({ message: `Server error: ${error.message}` });
        }
    });
}
exports.getTrempsByFilters = getTrempsByFilters;
function addUserToTremp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { tremp_id, user_id } = req.body;
            const updatedTremp = yield TrempService.addUserToTremp(tremp_id, user_id);
            if (updatedTremp.matchedCount === 0) {
                return res.status(404).json({ message: 'Tremp not found' });
            }
            if (updatedTremp.modifiedCount === 0) {
                return res.status(400).json({ message: 'User not added to the tremp' });
            }
            return res.status(200).json({ message: 'User successfully added to the tremp' });
        }
        catch (error) {
            return res.status(500).json({ message: `Server error: ${error.message}` });
        }
    });
}
exports.addUserToTremp = addUserToTremp;
function approveUserInTremp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tremp_id, creator_id, user_id, approval } = req.body;
        try {
            yield TrempService.approveUserInTremp(tremp_id, creator_id, user_id, approval);
            return res.status(200).json({ message: 'User approval status updated successfully' });
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    });
}
exports.approveUserInTremp = approveUserInTremp;
//# sourceMappingURL=TrempController.js.map