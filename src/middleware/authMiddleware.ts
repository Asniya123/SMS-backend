// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== VERIFY TOKEN MIDDLEWARE ===');
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);

    // Try to get token from multiple sources
    let token = req.cookies.jwt || req.cookies.token || req.cookies.authToken; // Check all possible cookie names
    
    // Check Authorization header (this is what your frontend is using)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    console.log('Extracted token:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        error: 'Access token is required',
        message: 'No authentication token found in cookies or headers'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: string;
      email?: string;
      role: string;
    };
    console.log('Decoded token:', decoded);

    // Validate required fields
    if (!decoded.id || !decoded.role) {
      console.log('❌ Token missing required fields');
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email || '',
      role: decoded.role,
    };

    console.log('✅ Token verified, user:', req.user);
    next();
  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    
    // Provide more specific error messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token format',
        code: 'INVALID_TOKEN'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'AUTH_FAILED'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== REQUIRE ADMIN MIDDLEWARE ===');
  console.log('User from request:', req.user);

  if (!req.user) {
    console.log('❌ No user found in request');
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    console.log('❌ User role is not admin:', req.user.role);
    return res.status(403).json({ error: 'Admin access required' });
  }

  console.log('✅ Admin access granted');
  next();
};

// Middleware to check if user is authenticated (student or admin)
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== REQUIRE AUTH MIDDLEWARE ===');
  if (!req.user) {
    console.log('❌ No user found in request');
    return res.status(401).json({ error: 'Authentication required' });
  }
  console.log('✅ Authentication verified');
  next();
};

// Middleware to check if user is student
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== REQUIRE STUDENT MIDDLEWARE ===');
  console.log('User from request:', req.user);

  if (!req.user) {
    console.log('❌ No user found in request');
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'student') {
    console.log('❌ User role is not student:', req.user.role);
    return res.status(403).json({ 
      error: 'Student access required',
      currentRole: req.user.role,
      requiredRole: 'student'
    });
  }

  console.log('✅ Student access granted');
  next();
};

// Middleware to check if user is tutor
export const requireTutor = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== REQUIRE TUTOR MIDDLEWARE ===');
  console.log('User from request:', req.user);

  if (!req.user) {
    console.log('❌ No user found in request');
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'tutor') {
    console.log('❌ User role is not tutor:', req.user.role);
    return res.status(403).json({ error: 'Tutor access required' });
  }

  console.log('✅ Tutor access granted');
  next();
};


export const verifyRefreshToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== VERIFY REFRESH TOKEN MIDDLEWARE ===');
    console.log('Cookies:', req.cookies);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // Try to get refresh token from multiple sources
    let refreshToken = req.cookies.refreshToken; // From cookies
    
    // Check request body (this is what your frontend is sending)
    if (!refreshToken && req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }
    
    // Check Authorization header as backup
    if (!refreshToken && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7);
      }
    }

    console.log('Extracted refresh token:', refreshToken ? 'Token exists' : 'No token');

    if (!refreshToken) {
      console.log('❌ No refresh token provided');
      return res.status(403).json({ 
        message: 'Invalid refresh token', // Match your frontend error expectation
        error: 'Refresh token is required'
      });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT_REFRESH_SECRET is not defined');
      return res.status(500).json({ 
        message: 'Server configuration error'
      });
    }

    // Verify refresh token with refresh secret
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as {
      id: string;
      email?: string;
      role: string;
    };
    
    console.log('Decoded refresh token:', decoded);

    req.user = {
      id: decoded.id,
      email: decoded.email || '',
      role: decoded.role,
    };

    console.log('✅ Refresh token verified');
    next();
  } catch (error: any) {
    console.error('❌ Refresh token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        message: 'Invalid refresh token', // Expired token
        error: 'Refresh token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        message: 'Invalid refresh token', // Invalid format
        error: 'Invalid refresh token format'
      });
    }
    
    return res.status(403).json({ 
      message: 'Invalid refresh token', // Generic error
      error: 'Token verification failed'
    });
  }
};
