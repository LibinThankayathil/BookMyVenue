import { prisma } from '../prisma/prisma';
import { PricingType } from '@prisma/client';
import {
  CreateVenueDto,
  UpdateVenueDto,
  CreateClosureDto,
  UpdateClosureDto,
} from '../dtos/venue.dto';

export class VenueService {
  /**
   * Retrieve all approved venues with their amenities and capacities.
   */
  async getAllVenues() {
    const venues = await prisma.venue.findMany({
      where: { status: 'APPROVED' },
      include: {
        amenities: {
          include: { amenity: true },
        },
        capacities: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return venues;
  }

  /**
   * Retrieve a single venue by its ID.
   */
  async getVenueById(id: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        amenities: {
          include: { amenity: true },
        },
        capacities: true,
        sessions: true,
      },
    });

    return venue;
  }

  // ─── Admin Methods ──────────────────────────────────────────────────────────

  /**
   * Retrieve all venues for admin review (any status).
   */
  async getAllVenuesForAdmin() {
    return prisma.venue.findMany({
      include: {
        amenities: { include: { amenity: true } },
        capacities: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retrieve all venues with PENDING status for admin review.
   */
  async getPendingVenues() {
    return prisma.venue.findMany({
      where: { status: 'PENDING' },
      include: {
        amenities: { include: { amenity: true } },
        capacities: true,
        sessions: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Approve a pending venue by setting its status to APPROVED.
   */
  async approveVenue(id: string) {
    return prisma.venue.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  /**
   * Reject a pending venue by setting its status to REJECTED.
   */
  async rejectVenue(id: string) {
    return prisma.venue.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  /**
   * Fetch all amenities
   */
  async getAllAmenities() {
    return prisma.amenity.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Creates a new venue and its related records (capacities, sessions, amenities)
   * in a single atomic transaction.
   */
  async createVenue(ownerId: string, data: CreateVenueDto) {
    const {
      title,
      description,
      category,
      basePrice,
      pricingType,
      bufferTimeMinutes,
      imageUrls,
      amenities,
      capacities,
      sessions,
      // Location
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      // Operating Schedule
      operatingDays,
    } = data;

    // Use Prisma nested write to insert everything atomically
    return await prisma.venue.create({
      data: {
        ownerId,
        title,
        description,
        category,
        basePrice,
        pricingType,
        bufferTimeMinutes,
        imageUrls,
        // Location
        address,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        // Operating Schedule
        operatingDays: operatingDays ?? [],
        // Nested relation inserts
        capacities: {
          create: capacities.map((cap) => ({
            type: cap.type,
            maxPeople: cap.maxPeople,
            isSeparate: cap.isSeparate ?? false,
          })),
        },
        sessions: {
          create:
            pricingType === PricingType.PER_SESSION && sessions
              ? sessions.map((sess) => ({
                  name: sess.name,
                  startTime: sess.startTime,
                  endTime: sess.endTime,
                  sessionPrice: sess.sessionPrice,
                }))
              : [],
        },
        amenities: {
          create: amenities.map((amenityId) => ({
            amenityId,
          })),
        },
      },
      // Include all related models in the returned response
      include: {
        capacities: true,
        sessions: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });
  }

  async getVenuesByOwner(ownerId: string) {
    return await prisma.venue.findMany({
      where: { ownerId },
      include: {
        amenities: {
          include: { amenity: true },
        },
        capacities: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateVenue(id: string, ownerId: string, data: UpdateVenueDto) {
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      return { status: 'NOT_FOUND', data: null };
    }

    if (venue.ownerId !== ownerId) {
      return { status: 'FORBIDDEN', data: null };
    }

    const {
      title,
      description,
      category,
      basePrice,
      pricingType,
      bufferTimeMinutes,
      imageUrls,
      amenities,
      capacities,
      sessions,
      // Location
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      // Operating Schedule
      operatingDays,
    } = data;

    const updatedVenue = await prisma.$transaction(async (tx) => {
      if (capacities !== undefined) {
        await tx.venueCapacity.deleteMany({ where: { venueId: id } });
        if (capacities.length > 0) {
          await tx.venueCapacity.createMany({
            data: capacities.map((cap) => ({
              venueId: id,
              type: cap.type,
              maxPeople: cap.maxPeople,
              isSeparate: cap.isSeparate ?? false,
            })),
          });
        }
      }

      if (sessions !== undefined) {
        await tx.venueSession.deleteMany({ where: { venueId: id } });
        const finalPricingType =
          pricingType !== undefined ? pricingType : venue.pricingType;
        if (
          finalPricingType === PricingType.PER_SESSION &&
          sessions.length > 0
        ) {
          await tx.venueSession.createMany({
            data: sessions.map((sess) => ({
              venueId: id,
              name: sess.name,
              startTime: sess.startTime,
              endTime: sess.endTime,
              sessionPrice: sess.sessionPrice,
            })),
          });
        }
      } else if (
        pricingType !== undefined &&
        pricingType !== venue.pricingType
      ) {
        if (pricingType === PricingType.PER_HOUR) {
          await tx.venueSession.deleteMany({ where: { venueId: id } });
        }
      }

      if (amenities !== undefined) {
        await tx.venueAmenity.deleteMany({ where: { venueId: id } });
        if (amenities.length > 0) {
          await tx.venueAmenity.createMany({
            data: amenities.map((amenityId) => ({
              venueId: id,
              amenityId,
            })),
          });
        }
      }

      const updated = await tx.venue.update({
        where: { id },
        data: {
          title: title !== undefined ? title : undefined,
          description: description !== undefined ? description : undefined,
          category: category !== undefined ? category : undefined,
          basePrice: basePrice !== undefined ? basePrice : undefined,
          pricingType: pricingType !== undefined ? pricingType : undefined,
          bufferTimeMinutes:
            bufferTimeMinutes !== undefined ? bufferTimeMinutes : undefined,
          imageUrls: imageUrls !== undefined ? imageUrls : undefined,
          // Location
          address: address !== undefined ? address : undefined,
          city: city !== undefined ? city : undefined,
          state: state !== undefined ? state : undefined,
          country: country !== undefined ? country : undefined,
          zipCode: zipCode !== undefined ? zipCode : undefined,
          latitude: latitude !== undefined ? latitude : undefined,
          longitude: longitude !== undefined ? longitude : undefined,
          // Operating Schedule
          operatingDays:
            operatingDays !== undefined ? operatingDays : undefined,
          status: 'PENDING',
        },
        include: {
          capacities: true,
          sessions: true,
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      });

      return updated;
    });

    return { status: 'SUCCESS', data: updatedVenue };
  }

  async deleteVenue(id: string, ownerId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      return { status: 'NOT_FOUND' };
    }

    if (venue.ownerId !== ownerId) {
      return { status: 'FORBIDDEN' };
    }

    await prisma.venue.delete({
      where: { id },
    });

    return { status: 'SUCCESS' };
  }

  async createClosure(
    venueId: string,
    ownerId: string,
    data: CreateClosureDto,
  ) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return { status: 'VENUE_NOT_FOUND', data: null };
    }

    if (venue.ownerId !== ownerId) {
      return { status: 'FORBIDDEN', data: null };
    }

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { status: 'INVALID_TIME', data: null };
    }

    if (start >= end) {
      return { status: 'INVALID_TIME_RANGE', data: null };
    }

    const closure = await prisma.venueClosure.create({
      data: {
        venueId,
        type: data.type,
        startTime: start,
        endTime: end,
        description: data.description ?? null,
      },
    });

    return { status: 'SUCCESS', data: closure };
  }

  async getClosures(venueId: string, ownerId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return { status: 'VENUE_NOT_FOUND', data: null };
    }

    if (venue.ownerId !== ownerId) {
      return { status: 'FORBIDDEN', data: null };
    }

    const closures = await prisma.venueClosure.findMany({
      where: { venueId },
      orderBy: { startTime: 'asc' },
    });

    return { status: 'SUCCESS', data: closures };
  }

  async deleteClosure(venueId: string, closureId: string, ownerId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return { status: 'VENUE_NOT_FOUND' };
    }

    if (venue.ownerId !== ownerId) {
      return { status: 'FORBIDDEN' };
    }

    const closure = await prisma.venueClosure.findUnique({
      where: { id: closureId },
    });

    if (!closure || closure.venueId !== venueId) {
      return { status: 'CLOSURE_NOT_FOUND' };
    }

    await prisma.venueClosure.delete({
      where: { id: closureId },
    });

    return { status: 'SUCCESS' };
  }

  async updateClosure(
    venueId: string,
    closureId: string,
    ownerId: string,
    data: UpdateClosureDto,
  ) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return { status: 'VENUE_NOT_FOUND', data: null };
    }

    if (venue.ownerId !== ownerId) {
      return { status: 'FORBIDDEN', data: null };
    }

    const closure = await prisma.venueClosure.findUnique({
      where: { id: closureId },
    });

    if (!closure || closure.venueId !== venueId) {
      return { status: 'CLOSURE_NOT_FOUND', data: null };
    }

    const finalStart =
      data.startTime !== undefined
        ? new Date(data.startTime)
        : closure.startTime;
    const finalEnd =
      data.endTime !== undefined ? new Date(data.endTime) : closure.endTime;

    if (isNaN(finalStart.getTime()) || isNaN(finalEnd.getTime())) {
      return { status: 'INVALID_TIME', data: null };
    }

    if (finalStart >= finalEnd) {
      return { status: 'INVALID_TIME_RANGE', data: null };
    }

    const updated = await prisma.venueClosure.update({
      where: { id: closureId },
      data: {
        type: data.type !== undefined ? data.type : undefined,
        startTime: data.startTime !== undefined ? finalStart : undefined,
        endTime: data.endTime !== undefined ? finalEnd : undefined,
        description:
          data.description !== undefined
            ? (data.description ?? null)
            : undefined,
      },
    });

    return { status: 'SUCCESS', data: updated };
  }

  // ─── Saved Venues Methods ─────────────────────────────────────────────────

  async saveVenue(userId: string, venueId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue || venue.status !== 'APPROVED') {
      return { status: 'VENUE_NOT_FOUND', data: null };
    }

    try {
      const savedVenue = await prisma.savedVenue.create({
        data: {
          userId,
          venueId,
        },
      });
      return { status: 'SUCCESS', data: savedVenue };
    } catch (err: any) {
      if (err.code === 'P2002') {
        // Unique constraint failed, already saved
        return { status: 'ALREADY_SAVED', data: null };
      }
      throw err;
    }
  }

  async unsaveVenue(userId: string, venueId: string) {
    try {
      await prisma.savedVenue.delete({
        where: {
          userId_venueId: {
            userId,
            venueId,
          },
        },
      });
      return { status: 'SUCCESS' };
    } catch (err: any) {
      if (err.code === 'P2025') {
        // Record not found
        return { status: 'NOT_FOUND' };
      }
      throw err;
    }
  }

  async getSavedVenues(userId: string) {
    const savedVenues = await prisma.savedVenue.findMany({
      where: {
        userId,
        venue: {
          status: 'APPROVED',
        },
      },
      include: {
        venue: {
          include: {
            amenities: {
              include: { amenity: true },
            },
            capacities: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { status: 'SUCCESS', data: savedVenues.map((sv) => sv.venue) };
  }
}
