export interface VenueSession {
  id: number;
  venueId: number;
  name: string;
  startTime: string;
  endTime: string;
  sessionPrice: string;
}

export interface Venue {
  id: number;
  ownerId: number;
  title: string;
  description: string | null;
  category: string;
  basePrice: string;
  pricingType: 'PER_HOUR' | 'PER_SESSION';
  bufferTimeMinutes: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrls: string[];
  sessions: VenueSession[];
}

export interface VenueClosure {
  id: number;
  venueId: number;
  type: 'MAINTENANCE' | 'HOLIDAY' | 'PRIVATE_EVENT';
  startTime: string;
  endTime: string;
  description: string | null;
}
