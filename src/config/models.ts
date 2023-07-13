// src/config/environment.ts

import UserModel  from '../resources/users/UserModel';
import AdminModel  from '../resources/adminUsers/AdminModel';
import TrempModel from '../resources/tremps/TrempModel';
import GiftModel from '../resources/gifts/GiftModel';
import { UserInTrempUpdateQuery } from '../resources/tremps/TrempInterfaces';
import GroupModel from '../resources/groups/GroupModel';

type Model = UserModel | AdminModel | TrempModel | UserInTrempUpdateQuery | GiftModel |GroupModel; 

export type { Model };
