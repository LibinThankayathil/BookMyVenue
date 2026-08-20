import { Request, Response, NextFunction } from 'express';

function extractRoles(req: Request): string[] {
  const userRolesHeader = req.headers['x-user-roles'] as string | undefined;
  if (!userRolesHeader) return [];
  return userRolesHeader.split(',').map((r) => r.trim().toUpperCase());
}

export const requireOwner = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  const roles = extractRoles(req);

  if (roles.length === 0) {
    return res.status(403).json({
      success: false,
      message:
        'Forbidden: Access restricted to venue owners (missing role context).',
    });
  }

  // Gateway injects roles as a comma-separated string (e.g., "OWNER,USER")
  if (!roles.includes('OWNER')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access restricted to venue owners.',
    });
  }

  next();
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  const roles = extractRoles(req);

  if (roles.length === 0) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access restricted to admins (missing role context).',
    });
  }

  if (!roles.includes('ADMIN')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access restricted to admins.',
    });
  }

  next();
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): any => {
  const userIdHeader = req.headers['x-user-id'];
  if (!userIdHeader) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User is not authenticated.',
    });
  }

  (req as any).user = {
    id: userIdHeader as string,
  };

  next();
};
