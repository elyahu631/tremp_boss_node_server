// src/config/environment.ts

import UserModel  from '../resources/users/UserModel';
import AdminModel  from '../resources/adminUsers/AdminModel';
import TrempModel from '../resources/tremps/TrempModel';
import { UserInTrempUpdateQuery } from '../resources/tremps/trempInterfaces';

type Model = UserModel | AdminModel | TrempModel | UserInTrempUpdateQuery; 

export type { Model };
