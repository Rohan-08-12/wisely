const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuthController {
  // POST /api/auth/signup
  static async signup(req, res, next) {
    try {
      const { email, password, name } = req.body;
      
      console.log('Signup attempt:', { email, hasPassword: !!password, name });

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log('User already exists');
        return res.status(409).json({
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          authId: hashedPassword // Store hashed password as authId for now
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.BETTER_AUTH_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user,
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.authId);
      if (!isValidPassword) {
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password'
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.BETTER_AUTH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  static async logout(req, res, next) {
    try {
      // In a JWT-based system, logout is handled client-side by removing the token
      // This endpoint exists for consistency with the API spec
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  static async getMe(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'No token provided'
          }
        });
      }

      const decoded = jwt.verify(token, process.env.BETTER_AUTH_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found'
          }
        });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
