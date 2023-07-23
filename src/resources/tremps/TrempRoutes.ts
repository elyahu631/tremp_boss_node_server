import express from "express";
import * as TrempController from "./TrempController";
import { handleErrors } from "../../middleware/handleErrors";
import { authenticateToken } from "../../middleware/auth";

const trempRoutes = express.Router();

trempRoutes.post("/add",authenticateToken, TrempController.createTremp);
trempRoutes.get("/all", authenticateToken, TrempController.getAllTremps);
trempRoutes.post('/trempsByFilters',authenticateToken, TrempController.getTrempsByFilters);
trempRoutes.put('/join-ride',authenticateToken, TrempController.addUserToTremp);
trempRoutes.post("/user-tremps",authenticateToken, TrempController.getUserTremps);
trempRoutes.put('/approveUserInTremp',authenticateToken ,TrempController.approveUserInTremp);
trempRoutes.delete('/delete-tremp',authenticateToken, TrempController.deleteTremp);

trempRoutes.use(handleErrors); 


export default trempRoutes;
