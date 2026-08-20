import { z } from 'zod';
import { PricingType, ClosureType } from '@prisma/client';

const capacitySchema = z.object({
  type: z.string().min(1, 'Capacity type is required'),
  maxPeople: z.number().int().positive('Max people must be a positive integer'),
  isSeparate: z.boolean().default(false),
});

const sessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  startTime: z
    .string()
    .regex(
      /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
      'Start time must be in HH:MM format',
    ),
  endTime: z
    .string()
    .regex(
      /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
      'End time must be in HH:MM format',
    ),
  sessionPrice: z.number().positive('Session price must be positive'),
});

export const createVenueSchema = z
  .object({
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters long')
        .max(255, 'Title is too long'),
      description: z.string().optional(),
      category: z.string().min(1, 'Category is required'),
      basePrice: z.number().positive('Base price must be a positive number'),
      pricingType: z.nativeEnum(PricingType).default(PricingType.PER_HOUR),
      bufferTimeMinutes: z
        .number()
        .int()
        .nonnegative('Buffer time cannot be negative')
        .default(60),
      imageUrls: z
        .array(z.string().url('Invalid image URL format'))
        .default([]),
      amenities: z
        .array(z.string().uuid('Invalid amenity ID format'))
        .default([]),
      capacities: z.array(capacitySchema).default([]),
      sessions: z.array(sessionSchema).default([]),
      // Location
      address: z.string().min(1, 'Address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      country: z.string().min(1, 'Country is required'),
      zipCode: z.string().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      // Operating Schedule
      operatingDays: z
        .array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']))
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { pricingType, sessions } = data.body;
    if (pricingType === PricingType.PER_SESSION) {
      if (!sessions || sessions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'At least one session is required when pricing type is PER_SESSION',
          path: ['body', 'sessions'],
        });
      }
    }
  });

export const updateVenueSchema = z
  .object({
    body: z.object({
      title: z
        .string()
        .min(3, 'Title must be at least 3 characters long')
        .max(255, 'Title is too long')
        .optional(),
      description: z.string().optional(),
      category: z.string().min(1, 'Category must not be empty').optional(),
      basePrice: z
        .number()
        .positive('Base price must be a positive number')
        .optional(),
      pricingType: z.nativeEnum(PricingType).optional(),
      bufferTimeMinutes: z
        .number()
        .int()
        .nonnegative('Buffer time cannot be negative')
        .optional(),
      imageUrls: z.array(z.string().url('Invalid image URL format')).optional(),
      amenities: z
        .array(z.string().uuid('Invalid amenity ID format'))
        .optional(),
      capacities: z.array(capacitySchema).optional(),
      sessions: z.array(sessionSchema).optional(),
      // Location
      address: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      country: z.string().min(1).optional(),
      zipCode: z.string().optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      // Operating Schedule
      operatingDays: z
        .array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']))
        .optional(),
    }),
    params: z.object({
      id: z.string().uuid('Invalid venue ID format'),
    }),
  })
  .superRefine((data, ctx) => {
    const { pricingType, sessions } = data.body;

    if (pricingType === PricingType.PER_SESSION) {
      if (!sessions || sessions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'At least one session is required when pricing type is PER_SESSION',
          path: ['body', 'sessions'],
        });
      }
    }
  });

export const createClosureSchema = z
  .object({
    body: z.object({
      type: z.nativeEnum(ClosureType),
      startTime: z
        .string()
        .datetime('Start time must be a valid ISO-8601 date string'),
      endTime: z
        .string()
        .datetime('End time must be a valid ISO-8601 date string'),
      description: z.string().max(500, 'Description is too long').optional(),
    }),
    params: z.object({
      id: z.string().uuid('Invalid venue ID format'),
    }),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time must be before end time',
        path: ['body', 'startTime'],
      });
    }
  });

export const getClosuresSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid venue ID format'),
  }),
});

export const deleteClosureSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid venue ID format'),
    closureId: z.string().uuid('Invalid closure ID format'),
  }),
});

export const updateClosureSchema = z
  .object({
    body: z.object({
      type: z.nativeEnum(ClosureType).optional(),
      startTime: z
        .string()
        .datetime('Start time must be a valid ISO-8601 date string')
        .optional(),
      endTime: z
        .string()
        .datetime('End time must be a valid ISO-8601 date string')
        .optional(),
      description: z.string().max(500, 'Description is too long').optional(),
    }),
    params: z.object({
      id: z.string().uuid('Invalid venue ID format'),
      closureId: z.string().uuid('Invalid closure ID format'),
    }),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data.body;
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start >= end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start time must be before end time',
          path: ['body', 'startTime'],
        });
      }
    }
  });
