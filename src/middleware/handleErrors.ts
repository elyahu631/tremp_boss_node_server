//  src/middleware/handleErrors.ts

import { NextFunction, Request, Response } from "express";
import { HttpException } from "../utils/HttpException";

export const handleErrors = (
    err: HttpException,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    console.log('====================================');
    console.log(message);
    console.log('====================================');
    res.status(status).send({
      status,
      message,
    });
  };