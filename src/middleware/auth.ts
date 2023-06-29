//  src/middleware/auth.ts

import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config/environment';

interface RequestWithUser extends Request {
  user?: string | object;  // or the type of your user object
}

export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, user?: object | string) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
