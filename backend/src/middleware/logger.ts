import { Request, Response, NextFunction } from 'express';

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[API Request] ${req.method} ${req.url}`);
  next();
};
