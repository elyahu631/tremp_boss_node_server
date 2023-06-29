// src/config/environment.ts

import UserModel  from '../resources/users/UserModel';
import AdminModel  from '../resources/adminUsers/AdminModel';

type Model = UserModel | AdminModel; 

export type { Model };
