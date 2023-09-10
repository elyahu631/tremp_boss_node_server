import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config/environment';

interface JWTPayload {
  id: string;
  rule: 'user' | 'admin';
}

// Define a custom Request type that includes the user object
interface RequestWithUser extends Request {
  user?: JWTPayload;
}

const verifyToken = (token: string | undefined, res: Response, callback: (user: JWTPayload) => void) => {
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, JWT_SECRET, (err: VerifyErrors | null, user?: JWTPayload) => {
    if (err || !user) {
      return res.sendStatus(403);
    }
    callback(user);
  });
};

// Middleware function to authenticate the token
export const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  verifyToken(token, res, (user) => {
    req.user = user;
    next();
  });
};

export const authenticateAdminToken = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  verifyToken(token, res, (user) => {
    if (user.rule !== 'admin') {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};
