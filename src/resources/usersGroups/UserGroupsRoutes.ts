// src/resources/userGroups/userGroupRouter.ts
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";
import { approveRequest, deleteGroupRequest ,getUsersRequest} from "./UserGroupsController";

const userGroupsRoutes: Router = express.Router();


userGroupsRoutes.delete("/cancel-group-request", authenticateToken, deleteGroupRequest);
userGroupsRoutes.put("/approve-group-request", authenticateToken, approveRequest);
userGroupsRoutes.post("/get-users-request",authenticateToken, getUsersRequest);



userGroupsRoutes.use(handleErrors); 

export default userGroupsRoutes;
