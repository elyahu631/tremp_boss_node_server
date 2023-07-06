// src/config/environment.ts

import UserModel  from '../resources/users/UserModel';
import AdminModel  from '../resources/adminUsers/AdminModel';
import TrempModel from '../resources/tremps/TrempModel';

type Model = UserModel | AdminModel | TrempModel; 

export type { Model };
