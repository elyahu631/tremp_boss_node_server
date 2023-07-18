//  src/middleware/handleErrors.ts

// src/middleware/handleErrors.ts

import { NextFunction, Request, Response } from "express";
import { HttpException } from "./HttpException";

export const handleErrors = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).send({
    status: false,
    error: {
      message,
      statusCode: status
    }
  });
};
