"use strict";
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
// index.js
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("./config/environment");
const UserRoutes_1 = __importDefault(require("./resources/users/UserRoutes"));
const AdminRoutes_1 = __importDefault(require("./resources/adminUsers/AdminRoutes"));
const TrempRoutes_1 = __importDefault(require("./resources/tremps/TrempRoutes"));
const GiftRoutes_1 = __importDefault(require("./resources/gifts/GiftRoutes"));
const GroupRoutes_1 = __importDefault(require("./resources/groups/GroupRoutes"));
const jsonErrorHandler_1 = require("./middleware/jsonErrorHandler");
const KpiRoutes_1 = __importDefault(require("./resources/kpis/KpiRoutes"));
/**
app object represents the entire web application and is responsible

for handling incoming requests, routing them to the appropriate handlers,

and generating responses.
*/
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // enable CORS 
app.use(express_1.default.json()); // parse incoming requests with JSON
app.use(jsonErrorHandler_1.jsonErrorHandler);
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('server runinig');
}));
//main api routs
app.use('/api/users', UserRoutes_1.default);
app.use('/api/adminUsers', AdminRoutes_1.default);
app.use("/api/tremps", TrempRoutes_1.default);
app.use('/api/gifts', GiftRoutes_1.default);
app.use('/api/groups', GroupRoutes_1.default);
app.use('/api/kpis', KpiRoutes_1.default);
app.listen(environment_1.PORT, () => console.log(`Server running on http://localhost:${environment_1.PORT}`));
//# sourceMappingURL=index.js.map