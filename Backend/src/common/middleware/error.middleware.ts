import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // 1. Operational AppError Subclasses (BadRequest, Unauthorized, Forbidden, NotFound, Conflict, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // 2. Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      statusCode: 400,
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // 3. Syntax / JSON Parsing Errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      success: false,
      message: 'Malformed JSON payload',
      statusCode: 400,
    });
    return;
  }

  // 4. Unexpected / Unhandled Internal Errors (500)
  // Mask sensitive database error details in production response
  console.error('[UnhandledError]', err);

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    message: isProduction ? 'An unexpected internal server error occurred' : err.message || 'Internal Server Error',
    statusCode: 500,
  });
};
