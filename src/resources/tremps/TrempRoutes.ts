import express from "express";
import * as TrempController from "./TrempController";
import { handleErrors } from "../../middleware/handleErrors";
import { authenticateAdminToken, authenticateToken } from "../../middleware/auth";

const trempRoutes = express.Router();

trempRoutes.post("/add",authenticateToken, TrempController.createTremp); 
trempRoutes.post('/tremps-by-filters',authenticateToken, TrempController.getTrempsByFilters);
trempRoutes.put('/join-ride',authenticateToken, TrempController.addUserToTremp);
trempRoutes.post("/user-tremps",authenticateToken, TrempController.getUserTremps);
trempRoutes.put('/approve-user-in-tremp',authenticateToken ,TrempController.approveUserInTremp);
trempRoutes.get('/users-in-tremp/:tremp_id',authenticateToken ,TrempController.getUsersInTremp);
trempRoutes.post('/approved-tremps',authenticateToken ,TrempController.getApprovedTremps);
trempRoutes.put('/delete-tremp',authenticateToken, TrempController.deleteTremp);
trempRoutes.put('/tremp-completed',authenticateToken, TrempController.trempCompleted);
trempRoutes.post('/tremp-history',authenticateToken, TrempController.getTrempHistory);

trempRoutes.get('/tremps', TrempController.getTremp);


//for admin
trempRoutes.get("/all", authenticateAdminToken, TrempController.getAllTremps);
trempRoutes.post("/upcoming-tremps", TrempController.checkNotificationsForUpcomingTremps);

trempRoutes.use(handleErrors); 


export default trempRoutes;
