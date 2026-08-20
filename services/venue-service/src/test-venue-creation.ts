import { VenueService } from './services/venue.service';
import { CreateVenueDto } from './dtos/venue.dto';
import { prisma, connectDb, disconnectDb } from './prisma/prisma';
import { PricingType } from '@prisma/client';

async function runTests() {
  await connectDb();
  console.log('🧪 Starting Venue Service verification tests...\n');

  const venueService = new VenueService();

  // Retrieve seeded amenities to get valid IDs
  const amenities = await prisma.amenity.findMany();
  if (amenities.length === 0) {
    throw new Error('Please seed amenities first using npm run db:seed');
  }
  const validAmenityIds = amenities.map((a) => a.id);
  console.log(`- Seeded amenity IDs in DB: ${validAmenityIds.join(', ')}`);

  // =========================================================================
  // Test 1: Successful Create Venue API & Database Transaction Test
  // =========================================================================
  console.log('\n---------------------------------------------------------');
  console.log('Test 1: Successful atomic transaction create venue');
  console.log('---------------------------------------------------------');

  const validPayload: CreateVenueDto = {
    title: 'Grand Palace Hall',
    description: 'A luxurious hall for weddings and corporate events',
    category: 'wedding_hall',
    basePrice: 150.0,
    pricingType: PricingType.PER_SESSION,
    bufferTimeMinutes: 60,
    imageUrls: [
      'http://example.com/image1.jpg',
      'http://example.com/image2.jpg',
    ],
    amenities: validAmenityIds.slice(0, 2), // Pick first two valid amenities
    capacities: [
      { type: 'SEATING', maxPeople: 500 },
      { type: 'DINING', maxPeople: 300 },
    ],
    sessions: [
      {
        name: 'Morning',
        startTime: '08:00',
        endTime: '13:00',
        sessionPrice: 600.0,
      },
      {
        name: 'Evening',
        startTime: '16:00',
        endTime: '22:00',
        sessionPrice: 800.0,
      },
    ],
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    country: 'USA',
  };

  const ownerId = '123'; // Valid owner ID placeholder
  const createdVenue = await venueService.createVenue(ownerId, validPayload);

  console.log('✅ Venue created successfully!');
  console.log(`- Venue ID: ${createdVenue.id}`);
  console.log(`- Title: ${createdVenue.title}`);
  console.log(
    `- Capacities created: ${createdVenue.capacities.length} profiles`,
  );
  console.log(`- Sessions created: ${createdVenue.sessions.length} sessions`);
  console.log(`- Amenities linked: ${createdVenue.amenities.length} links`);

  // Assertions
  if (createdVenue.title !== validPayload.title)
    throw new Error('Assertion failed: Title mismatch');
  if (createdVenue.capacities.length !== 2)
    throw new Error('Assertion failed: Capacities count mismatch');
  if (createdVenue.sessions.length !== 2)
    throw new Error('Assertion failed: Sessions count mismatch');
  if (createdVenue.amenities.length !== 2)
    throw new Error('Assertion failed: Amenities count mismatch');

  // =========================================================================
  // Test 2: Foreign Key Constraint Failure & Transaction Rollback Test
  // =========================================================================
  console.log('\n---------------------------------------------------------');
  console.log('Test 2: Foreign key failure transaction rollback');
  console.log('---------------------------------------------------------');

  const invalidPayload: CreateVenueDto = {
    title: 'Should Rollback Venue',
    description:
      'This venue should not be saved in DB because of invalid amenity',
    category: 'auditorium',
    basePrice: 100.0,
    pricingType: PricingType.PER_HOUR,
    bufferTimeMinutes: 30,
    imageUrls: [],
    amenities: ['99999'], // Invalid non-existent amenity ID!
    capacities: [{ type: 'SEATING', maxPeople: 100 }],
    address: '456 Test Avenue',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
  };

  // Record initial count of venues
  const initialCount = await prisma.venue.count();

  try {
    await venueService.createVenue(ownerId, invalidPayload);
    console.error(
      '❌ Error: Transaction succeeded when it should have failed!',
    );
    throw new Error('Assertion failed: Transaction did not fail on invalid FK');
  } catch (error: unknown) {
    console.log(
      '✅ Received expected transaction error due to invalid foreign key.',
    );
    const err = error as { code?: string; message?: string };
    console.log(`- Error Code/Message: ${err.code || err.message}`);

    // Verify transaction rollback
    const finalCount = await prisma.venue.count();
    if (finalCount === initialCount) {
      console.log('✅ Rollback verified: No new venue records were persisted.');
    } else {
      console.error(
        `❌ Rollback failed: Venue count increased from ${initialCount} to ${finalCount}`,
      );
      throw new Error('Assertion failed: Transaction was not rolled back', {
        cause: error,
      });
    }
  }

  console.log('\n🎉 All tests passed successfully!');
}

runTests()
  .catch((err) => {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDb();
  });
