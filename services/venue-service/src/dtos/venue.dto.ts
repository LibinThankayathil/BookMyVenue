import { PricingType, ClosureType } from '@prisma/client';

export interface CreateClosureDto {
  type: ClosureType;
  startTime: string | Date;
  endTime: string | Date;
  description?: string;
}

export interface UpdateClosureDto {
  type?: ClosureType;
  startTime?: string | Date;
  endTime?: string | Date;
  description?: string;
}

export interface CreateVenueDto {
  title: string;
  description?: string;
  category: string;
  basePrice: number;
  pricingType: PricingType;
  bufferTimeMinutes: number;
  imageUrls: string[];
  amenities: string[];
  capacities: {
    type: string;
    maxPeople: number;
    isSeparate?: boolean;
  }[];
  sessions?: {
    name: string;
    startTime: string;
    endTime: string;
    sessionPrice: number;
  }[];
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  // Operating Schedule
  operatingDays?: string[];
}

export interface UpdateVenueDto {
  title?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  pricingType?: PricingType;
  bufferTimeMinutes?: number;
  imageUrls?: string[];
  amenities?: string[];
  capacities?: {
    type: string;
    maxPeople: number;
    isSeparate?: boolean;
  }[];
  sessions?: {
    name: string;
    startTime: string;
    endTime: string;
    sessionPrice: number;
  }[];
  // Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  // Operating Schedule
  operatingDays?: string[];
}
