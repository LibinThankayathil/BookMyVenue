import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    fullName: z.string().min(2, 'Name must be at least 2 characters long'),
    roles: z.array(z.enum(['USER', 'OWNER'])).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifySchema = z.object({
  body: z.object({
    token: z.string().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    phoneNumber: z.string().optional(),
    businessName: z.string().optional(),
    bankRoutingNumber: z.string().optional(),
    bankAccountNumber: z.string().optional(),
  }),
});
