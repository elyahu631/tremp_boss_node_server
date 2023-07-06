import express from "express";
import * as TrempController from "./TrempController";
import { handleErrors } from "../../middleware/handleErrors";
import { authenticateToken } from "../../middleware/auth";

const tremprRouter = express.Router();

tremprRouter.post("/add",authenticateToken, TrempController.createTremp);
tremprRouter.post('/trempsByFilters',authenticateToken, TrempController.getTrempsByFilters);
tremprRouter.put('/join-ride',authenticateToken, TrempController.addUserToTremp);
tremprRouter.put('/approveUserInTremp',authenticateToken ,TrempController.approveUserInTremp);

tremprRouter.use(handleErrors); 


export default tremprRouter;
