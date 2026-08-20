import { prisma, connectDb, disconnectDb } from './prisma/prisma';

async function main() {
  await connectDb();

  const amenities = await prisma.amenity.findMany();
  console.log(
    'Amenities in DB:',
    amenities.map((a) => a.name),
  );

  if (amenities.length === 0) {
    console.log('No amenities found. Seeding default amenities...');
    await prisma.amenity.createMany({
      data: [
        { name: 'Wifi', iconKey: 'wifi' },
        { name: 'AC', iconKey: 'ac_unit' },
        { name: 'Projector', iconKey: 'videocam' },
        { name: 'Parking', iconKey: 'local_parking' },
      ],
    });
    const updated = await prisma.amenity.findMany();
    console.log(
      'Seeded amenities list:',
      updated.map((a) => a.name),
    );
  }
}

main()
  .catch((err) => {
    console.error('Database connection error during seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDb();
  });
