import express from "express";
import * as TrempController from "./TrempController";
import { handleErrors } from "../../middleware/handleErrors";
import { authenticateToken } from "../../middleware/auth";

const trempRoutes = express.Router();

trempRoutes.post("/add",authenticateToken, TrempController.createTremp);
trempRoutes.post('/trempsByFilters',authenticateToken, TrempController.getTrempsByFilters);
trempRoutes.put('/join-ride',authenticateToken, TrempController.addUserToTremp);
trempRoutes.put('/approveUserInTremp',authenticateToken ,TrempController.approveUserInTremp);

trempRoutes.use(handleErrors); 


export default trempRoutes;
