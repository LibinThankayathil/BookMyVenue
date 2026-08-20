import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';
import fs from 'fs';

const isDocker = fs.existsSync('/.dockerenv');
let connectionString = process.env.DATABASE_URL;
if (isDocker && connectionString) {
  connectionString = connectionString.replace('@localhost:', '@bmv_db:');
}

const needsSsl = connectionString?.includes('sslmode=require');
const cleanUrl = connectionString?.replace(/[?&]sslmode=require/g, '');

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // 1. Find the AV Equipment amenity ID (if it exists)
  const avEquipment = await prisma.amenity.findFirst({ where: { name: 'AV Equipment' } });

  if (avEquipment) {
    // 2. Add Projector (if not exists)
    let projector = await prisma.amenity.findFirst({ where: { name: 'Projector' } });
    if (!projector) {
      projector = await prisma.amenity.create({ data: { name: 'Projector', iconKey: 'projector' } });
    }

    // 3. Add Audio System (if not exists)
    let audio = await prisma.amenity.findFirst({ where: { name: 'Audio System' } });
    if (!audio) {
      audio = await prisma.amenity.create({ data: { name: 'Audio System', iconKey: 'audio' } });
    }

    // 4. Migrate VenueAmenity records from AV Equipment to Projector and Audio System
    // Get all venues with AV Equipment
    const venuesWithAV = await prisma.venueAmenity.findMany({
      where: { amenityId: avEquipment.id },
      select: { venueId: true },
    });

    for (const { venueId } of venuesWithAV) {
      // Add Projector (if not already present)
      const existingProjector = await prisma.venueAmenity.findUnique({
        where: {
          venueId_amenityId: {
            venueId,
            amenityId: projector.id,
          },
        },
      });
      if (!existingProjector) {
        await prisma.venueAmenity.create({
          data: {
            venueId,
            amenityId: projector.id,
          },
        });
      }

      // Add Audio System (if not already present)
      const existingAudio = await prisma.venueAmenity.findUnique({
        where: {
          venueId_amenityId: {
            venueId,
            amenityId: audio.id,
          },
        },
      });
      if (!existingAudio) {
        await prisma.venueAmenity.create({
          data: {
            venueId,
            amenityId: audio.id,
          },
        });
      }
    }

    // 5. Now safe to delete AV Equipment (VenueAmenity records cascade on delete)
    await prisma.amenity.deleteMany({
      where: { name: 'AV Equipment' }
    });
  } else {
    // AV Equipment doesn't exist, just ensure Projector and Audio System exist
    const projector = await prisma.amenity.findFirst({ where: { name: 'Projector' } });
    if (!projector) {
      await prisma.amenity.create({ data: { name: 'Projector', iconKey: 'projector' } });
    }

    const audio = await prisma.amenity.findFirst({ where: { name: 'Audio System' } });
    if (!audio) {
      await prisma.amenity.create({ data: { name: 'Audio System', iconKey: 'audio' } });
    }
  }

  // Update Catering iconKey
  await prisma.amenity.updateMany({
    where: { name: 'Catering' },
    data: { iconKey: 'utensils' }
  });

  // Update Outdoor Space iconKey to match seed.ts
  await prisma.amenity.updateMany({
    where: { name: 'Outdoor Space' },
    data: { iconKey: 'treePine' }
  });

  console.log("Done updating amenities.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
