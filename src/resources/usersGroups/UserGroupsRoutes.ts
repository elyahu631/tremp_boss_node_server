// src/resources/userGroups/userGroupRouter.ts
import express, { Router } from "express";
import { authenticateToken } from "../../middleware/auth";
import {handleErrors} from "../../middleware/handleErrors";
import { approveRequest, deleteGroupRequest, getGroupRequests, getUsersByGroup } from "./UserGroupsController";

const userGroupsRoutes: Router = express.Router();


// userGroupRouter.post("/request-join-group", authenticateToken, requestJoinGroup);
userGroupsRoutes.put("/approve-join-group-request", authenticateToken, approveRequest);
userGroupsRoutes.post("/users-group-requests",authenticateToken, getGroupRequests);
userGroupsRoutes.post("/get-users-by-group", getUsersByGroup);
userGroupsRoutes.delete("/cancel-group-request", authenticateToken, deleteGroupRequest);


userGroupsRoutes.use(handleErrors); 

export default userGroupsRoutes;
