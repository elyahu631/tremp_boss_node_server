// src/middleware/jsonErrorHandler.ts

import { Request, Response, NextFunction } from 'express';

export const jsonErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).send({ status: false, error: { message: 'Invalid JSON', statusCode: 400 } });
  }

  next(err);
};
