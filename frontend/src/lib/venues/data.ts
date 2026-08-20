export type VenueAmenity = {
  label: string;
  icon: "wifi" | "kitchen" | "parking" | "speaker";
};

export type VenueReview = {
  author: string;
  initials: string;
  date: string;
  text: string;
};

export type VenueBadge = "luxury" | "featured";

export type Venue = {
  id: string;
  name: string;
  location: string;
  neighborhood: string;
  city: string;
  capacity: number;
  pricePerDay: number;
  pricingType?: "PER_HOUR" | "PER_SESSION";
  basePrice?: number;
  category?: string;
  bufferTimeMinutes?: number;
  sessions?: {
    name: string;
    startTime: string;
    endTime: string;
    sessionPrice: number;
  }[];
  rating: number;
  reviewCount: number;
  description: string;
  badges?: VenueBadge[];
  eventTypes: string[];
  amenityFilters: string[];
  images: {
    main: string;
    gallery: string[];
  };
  amenities: VenueAmenity[];
  reviews: VenueReview[];
  // Location
  address?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  // Operating Schedule
  operatingDays?: string[];
};

const IMG = {
  main: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZVaLCu_F4y5WibwiWnM4CJIrXmF7N7ZCzdhskxj69ztYwg5DW6z6AHxiWNAIQ1YogUKY5np1YWQiFHdNPpBFgeWAKqixlgXZO_DoblJvENIjsqIdV7vv60HhSSMF0wTQ8p0WXApwU3xndBxwS1NlvFcwee16gk0vXlBWDR0c-_XoViqA6XHVFtqwOnzAImanTew0cMY--_YEj9db9Mf0CLUOv_oLPUSnmek4SOb6MpYJM_MieSW8YTz73Q02DsGhoCWQZuYnxSmJj",
  g1: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2fxS1NhDqBvALDxDHvwxR4tP6C6YFCEPRBAiqXq3Ga9Viyu_AoQSVlsxyNeG1q4i0MZXtJ7cuRNbQ0-1QPRUYhXrJs65C-ZDqLm-0Rlop8leF5dZWrj1vzu-mDItf2UnhPcAcHnDhzU2lunis89lYmKA7JNu3Og0RAB5kHlXLZRd1LW8POzEWiDiDhDNsroPZRwiyj8LfExdpuRlir-58KeEbOX0ks-zo29M1oaPePPgmWeWWZ5v3ckTYYsDwaP6YWV9nHBTS77rE",
  g2: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1c41gnAmVDsbOVFhdnDk1x1dH0HoxnHrpuXyf97VjukJo6hCWLzLJuB-ezrUVlBiJSvCuyipD60TX7ffVoTq8UBoqZoSTmDpE_i0C0rAXoVhkLDDEnqtFhl0QBBfCFq-nq0SunRATEIcWQZcbH5jTrBauA-k68AXTO0ASlg6LTASjYbUR5LtYyCF9QNEdyMbqF8BK4J8JBtmkRnSACwjN0pSI7JYW1Vh0qataw12-nPAnCWh8vFFs7rRyEpo5doEza9IXxUscsHNe",
  g3: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5ED0PF3-u7ejVzCyRfqZiL5j3rfLoID0Jc38kffDORhW0m6ch2w5jDTK3qJmAegBk8h-7zRf9io2yFbFLg0gDozn_VicMFh7P8jXTkItGEqY-ZlmtNUxQJwA_MpllZushxjw9hPGwd9mN0fczS_fLn0Z3FsPekronIXFn8zhrn6FUGgLo5hYFRqfWOMHV6MtRuajVzBJa64Ib5cPWGdssfGPYQymtqhgI7kiUiDN6W3hMxHKcxB0Q88f75lh6Qsz47hIslcllc4MC",
  g4: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgYqpoywjw4N865RNkeei2rj-8F1DLDcontZxF5tdu7JNZPn1efnYhRoUJZIPt6lvPNEA2jQX6OsQeStr0UY2swqbb9QmDQveDAlcpq4td8mfyZzXDr5PqN7H_PKfz_IP2bdioL9vNj7PDKtlHqPf9TqPhqpqgGGT7WXsW52iICo1tE1tJ7gXgc4P-j9A2RSG0aUZq_QI9xoEluYqea567vEUlOKurJVnlJm1up6ck6_Rgd71PfNE946ygtd76MzQbGK5fZHvmX_-k",
};

export const VENUES: Record<string, Venue> = {
  "glass-pavilion": {
    id: "glass-pavilion",
    name: "The Glass Pavilion",
    location: "Kensington, London",
    neighborhood: "Kensington",
    city: "London",
    capacity: 250,
    pricePerDay: 120000,
    rating: 4.9,
    reviewCount: 124,
    badges: ["luxury"],
    eventTypes: ["Wedding Reception", "Corporate Gala", "Private Party"],
    amenityFilters: ["Catering", "Valet Parking", "WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "Experience unparalleled elegance at The Glass Pavilion. This architectural masterpiece offers panoramic views through its signature floor-to-ceiling glass walls, creating a breathtaking atmosphere perfect for premium events and weddings.",
    images: { main: IMG.main, gallery: [IMG.g1, IMG.g2, IMG.g3, IMG.g4] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "Valet Parking", icon: "parking" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "Sarah Jenkins",
        initials: "SJ",
        date: "October 2023",
        text: "Absolutely stunning. The natural light in this venue is incredible. Our guests couldn't stop talking about the views.",
      },
    ],
  },
  "royal-botanic-hall": {
    id: "royal-botanic-hall",
    name: "Royal Botanic Hall",
    location: "Chelsea, London",
    neighborhood: "Chelsea",
    city: "London",
    capacity: 150,
    pricePerDay: 95000,
    rating: 4.8,
    reviewCount: 98,
    badges: ["featured"],
    eventTypes: ["Wedding Reception", "Corporate Gala"],
    amenityFilters: ["Catering", "WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "A grand Victorian hall surrounded by lush botanical gardens. Perfect for elegant receptions and corporate galas with a timeless atmosphere.",
    images: { main: IMG.g1, gallery: [IMG.main, IMG.g2, IMG.g3, IMG.g4] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "Emma Watson",
        initials: "EW",
        date: "September 2023",
        text: "The gardens made our wedding photos magical. Staff were incredibly helpful throughout.",
      },
    ],
  },
  "minster-loft": {
    id: "minster-loft",
    name: "The Minster Loft",
    location: "Shoreditch, London",
    neighborhood: "Shoreditch",
    city: "London",
    capacity: 120,
    pricePerDay: 78000,
    rating: 4.7,
    reviewCount: 76,
    eventTypes: ["Private Party", "Photography Studio", "Corporate Gala"],
    amenityFilters: ["WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "Industrial-chic loft space with exposed brick, skylights, and a versatile open floor plan ideal for creative events and intimate gatherings.",
    images: { main: IMG.g2, gallery: [IMG.main, IMG.g1, IMG.g3, IMG.g4] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "James Chen",
        initials: "JC",
        date: "July 2023",
        text: "Perfect for our product launch. The raw aesthetic gave us exactly the vibe we wanted.",
      },
    ],
  },
  "skyline-terrace": {
    id: "skyline-terrace",
    name: "Skyline Terrace",
    location: "Canary Wharf, London",
    neighborhood: "Canary Wharf",
    city: "London",
    capacity: 300,
    pricePerDay: 145000,
    rating: 4.9,
    reviewCount: 112,
    badges: ["luxury", "featured"],
    eventTypes: ["Corporate Gala", "Wedding Reception", "Private Party"],
    amenityFilters: ["Catering", "Valet Parking", "WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "Rooftop terrace with sweeping city skyline views. An unforgettable setting for large-scale celebrations and executive events.",
    images: { main: IMG.g3, gallery: [IMG.main, IMG.g1, IMG.g2, IMG.g4] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "Valet Parking", icon: "parking" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "Priya Sharma",
        initials: "PS",
        date: "November 2023",
        text: "The sunset views during our gala were absolutely breathtaking. Worth every penny.",
      },
    ],
  },
  "heritage-manor": {
    id: "heritage-manor",
    name: "Heritage Manor",
    location: "Hampstead, London",
    neighborhood: "Hampstead",
    city: "London",
    capacity: 180,
    pricePerDay: 110000,
    rating: 4.8,
    reviewCount: 89,
    badges: ["luxury"],
    eventTypes: ["Wedding Reception", "Private Party"],
    amenityFilters: ["Catering", "Valet Parking", "WIFI", "AC"],
    description:
      "A restored Georgian manor with manicured grounds and opulent interiors, offering old-world charm for distinguished celebrations.",
    images: { main: IMG.g4, gallery: [IMG.main, IMG.g1, IMG.g2, IMG.g3] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "Valet Parking", icon: "parking" },
    ],
    reviews: [
      {
        author: "Oliver Grant",
        initials: "OG",
        date: "June 2023",
        text: "Our wedding felt like a fairy tale. The manor's character is unmatched.",
      },
    ],
  },
  "urban-studio": {
    id: "urban-studio",
    name: "Urban Studio",
    location: "Camden, London",
    neighborhood: "Camden",
    city: "London",
    capacity: 80,
    pricePerDay: 45000,
    rating: 4.6,
    reviewCount: 54,
    eventTypes: ["Photography Studio", "Private Party"],
    amenityFilters: ["WIFI", "AC"],
    description:
      "Minimalist white-box studio with professional lighting rigs and flexible layout — ideal for shoots, workshops, and small creative events.",
    images: { main: IMG.main, gallery: [IMG.g2, IMG.g3, IMG.g4, IMG.g1] },
    amenities: [{ label: "High-Speed WiFi", icon: "wifi" }],
    reviews: [
      {
        author: "Lisa Park",
        initials: "LP",
        date: "May 2023",
        text: "Clean, bright, and well-equipped. Our fashion shoot went flawlessly.",
      },
    ],
  },
  "riverside-pavilion": {
    id: "riverside-pavilion",
    name: "Riverside Pavilion",
    location: "Richmond, London",
    neighborhood: "Richmond",
    city: "London",
    capacity: 200,
    pricePerDay: 88000,
    rating: 4.7,
    reviewCount: 67,
    badges: ["featured"],
    eventTypes: ["Wedding Reception", "Corporate Gala", "Private Party"],
    amenityFilters: ["Catering", "WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "Waterfront pavilion with floor-to-ceiling windows overlooking the Thames. A serene backdrop for memorable occasions.",
    images: { main: IMG.g1, gallery: [IMG.main, IMG.g3, IMG.g4, IMG.g2] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "David Miller",
        initials: "DM",
        date: "August 2023",
        text: "The river views at golden hour were spectacular. Guests loved the ambiance.",
      },
    ],
  },
  "grand-ballroom": {
    id: "grand-ballroom",
    name: "The Grand Ballroom",
    location: "Mayfair, London",
    neighborhood: "Mayfair",
    city: "London",
    capacity: 400,
    pricePerDay: 180000,
    rating: 4.9,
    reviewCount: 156,
    badges: ["luxury"],
    eventTypes: ["Corporate Gala", "Wedding Reception"],
    amenityFilters: ["Catering", "Valet Parking", "WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "Opulent ballroom with crystal chandeliers, marble floors, and a dedicated events team for large-scale galas and luxury weddings.",
    images: { main: IMG.g2, gallery: [IMG.main, IMG.g1, IMG.g4, IMG.g3] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "Valet Parking", icon: "parking" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "Michael Rodriguez",
        initials: "MR",
        date: "December 2023",
        text: "Hosted our annual gala here. Impeccable service and a truly grand setting.",
      },
    ],
  },
  "garden-estate": {
    id: "garden-estate",
    name: "Garden Estate",
    location: "Greenwich, London",
    neighborhood: "Greenwich",
    city: "London",
    capacity: 220,
    pricePerDay: 102000,
    rating: 4.8,
    reviewCount: 83,
    eventTypes: ["Wedding Reception", "Private Party"],
    amenityFilters: ["Catering", "Valet Parking", "WIFI", "AC"],
    description:
      "Sprawling estate with walled gardens, a glass conservatory, and multiple event spaces for multi-day celebrations.",
    images: { main: IMG.g3, gallery: [IMG.main, IMG.g2, IMG.g1, IMG.g4] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
      { label: "Valet Parking", icon: "parking" },
    ],
    reviews: [
      {
        author: "Anna Kowalski",
        initials: "AK",
        date: "April 2023",
        text: "The gardens were in full bloom for our spring wedding. Absolutely magical.",
      },
    ],
  },
  "rooftop-lounge": {
    id: "rooftop-lounge",
    name: "Rooftop Lounge",
    location: "Soho, London",
    neighborhood: "Soho",
    city: "London",
    capacity: 100,
    pricePerDay: 65000,
    rating: 4.5,
    reviewCount: 42,
    eventTypes: ["Private Party", "Corporate Gala"],
    amenityFilters: ["Catering", "WIFI", "Audio/Visual Equipment"],
    description:
      "Trendy rooftop lounge with cocktail bar, DJ booth, and panoramic views over Soho — perfect for after-parties and launch events.",
    images: { main: IMG.g4, gallery: [IMG.main, IMG.g1, IMG.g2, IMG.g3] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "Tom Hughes",
        initials: "TH",
        date: "February 2023",
        text: "Great vibe for our brand launch party. The rooftop setting was a hit.",
      },
    ],
  },
  "art-deco-gallery": {
    id: "art-deco-gallery",
    name: "Art Deco Gallery",
    location: "South Bank, London",
    neighborhood: "South Bank",
    city: "London",
    capacity: 160,
    pricePerDay: 72000,
    rating: 4.7,
    reviewCount: 61,
    badges: ["featured"],
    eventTypes: ["Corporate Gala", "Photography Studio", "Private Party"],
    amenityFilters: ["WIFI", "Audio/Visual Equipment", "AC"],
    description:
      "Restored 1930s gallery with original Art Deco details, high ceilings, and a dramatic central atrium for exhibitions and events.",
    images: { main: IMG.main, gallery: [IMG.g4, IMG.g3, IMG.g2, IMG.g1] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "AV Equipment", icon: "speaker" },
    ],
    reviews: [
      {
        author: "Rachel Green",
        initials: "RG",
        date: "January 2024",
        text: "The architecture alone makes this venue special. Our exhibition opening was a success.",
      },
    ],
  },
  "velvet-salon": {
    id: "velvet-salon",
    name: "Velvet Salon",
    location: "Notting Hill, London",
    neighborhood: "Notting Hill",
    city: "London",
    capacity: 90,
    pricePerDay: 58000,
    rating: 4.6,
    reviewCount: 38,
    eventTypes: ["Private Party", "Wedding Reception", "Photography Studio"],
    amenityFilters: ["Catering", "WIFI", "AC"],
    description:
      "Intimate salon with velvet furnishings, warm lighting, and a Parisian-inspired aesthetic — ideal for boutique celebrations.",
    images: { main: IMG.g1, gallery: [IMG.g2, IMG.main, IMG.g4, IMG.g3] },
    amenities: [
      { label: "High-Speed WiFi", icon: "wifi" },
      { label: "Chef's Kitchen", icon: "kitchen" },
    ],
    reviews: [
      {
        author: "Sophie Turner",
        initials: "ST",
        date: "March 2023",
        text: "Cozy and elegant. Perfect size for our intimate engagement dinner.",
      },
    ],
  },
};

export function getVenue(id: string): Venue | undefined {
  return VENUES[id];
}

export function getAllVenueIds(): string[] {
  return Object.keys(VENUES);
}

export function getAllVenues(): Venue[] {
  return Object.values(VENUES);
}

export type VenueCategory = {
  id: string;
  label: string;
  icon: "heart" | "briefcase" | "cake" | "camera";
};

export const VENUE_CATEGORIES: VenueCategory[] = [
  { id: "weddings", label: "Weddings", icon: "heart" },
  { id: "corporate", label: "Corporate", icon: "briefcase" },
  { id: "birthdays", label: "Birthdays", icon: "cake" },
  { id: "studios", label: "Studios", icon: "camera" },
];
