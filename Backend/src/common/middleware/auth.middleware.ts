import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error.js';

import { config } from '../../config/env.js';

export const JWT_SECRET = config.jwtSecret;

export interface AuthenticatedUser {
  userId: number;
  username: string;
  role: string;
  branchId?: number;
  permissions?: string[];
  branchIds?: number[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Access token is missing or invalid');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      username: string;
      role: string;
      branchId?: number;
      permissions?: string[];
      branchIds?: number[];
    };

    const assignedBranchId = decoded.branchId || (decoded.branchIds && decoded.branchIds[0]) || 1;

    (req as AuthenticatedRequest).user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      branchId: assignedBranchId,
      permissions: decoded.permissions || [],
      branchIds: decoded.branchIds || (assignedBranchId ? [assignedBranchId] : [1]),
    };

    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};

export const authenticate = authenticateJWT;

export const authorize = (allowedRoles: string | string[], requiredPermissions?: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Administrators always bypass role & permission checks
    if (user.role === 'ADMINISTRATOR') {
      return next();
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (rolesArray.length > 0 && !rolesArray.includes(user.role)) {
      throw new ForbiddenError('Access denied: insufficient role permissions');
    }

    if (requiredPermissions) {
      const permsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      const userPerms = user.permissions || [];
      const hasPerm = permsArray.some((p) => userPerms.includes(p));
      if (!hasPerm && userPerms.length > 0) {
        throw new ForbiddenError('Access denied: missing required action permission');
      }
    }

    next();
  };
};

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (user.role === 'ADMINISTRATOR') {
      return next();
    }

    const userPerms = user.permissions || [];
    const hasAll = permissions.every((p) => userPerms.includes(p));
    if (!hasAll) {
      throw new ForbiddenError(`Access denied: missing required permissions (${permissions.join(', ')})`);
    }

    next();
  };
};

export const branchAccess = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  // Administrators can explicitly access all branches globally
  if (user.role === 'ADMINISTRATOR') {
    return next();
  }

  const userBranches = user.branchIds || (user.branchId ? [user.branchId] : []);
  if (userBranches.length === 0) {
    throw new ForbiddenError('Access denied: User has no assigned branches');
  }

  const requestedBranch =
    req.params.branchId ||
    req.query.branchId ||
    req.headers['x-branch-id'] ||
    (req.body && req.body.branchId);

  if (requestedBranch) {
    const targetBranchId = Number(requestedBranch);
    if (!userBranches.includes(targetBranchId)) {
      throw new ForbiddenError(`Access denied: User is not authorized to access Branch ID ${targetBranchId}`);
    }
  }

  next();
};
