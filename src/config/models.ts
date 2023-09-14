// src/config/environment.ts

import UserModel  from '../resources/users/UserModel';
import AdminModel  from '../resources/adminUsers/AdminModel';
import TrempModel from '../resources/tremps/TrempModel';
import { UserInTrempUpdateQuery } from '../resources/tremps/TrempInterfaces';
import GroupModel from '../resources/groups/GroupModel';
import UserGroupsModel from '../resources/usersGroups/UserGroupsModel';
import OpenGroupModel from '../resources/groupRequest/GroupRequestModel';

type Model = UserModel | AdminModel | TrempModel | UserInTrempUpdateQuery |
GroupModel| UserGroupsModel |OpenGroupModel; 

export type { Model };
