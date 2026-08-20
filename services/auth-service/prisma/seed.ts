import { prisma } from '../src/prisma/prisma';
import * as bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting database seeding...');

  // 1. Create Roles
  const roles = ['USER', 'ADMIN', 'OWNER'];
  const createdRoles: Record<string, any> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} Role`,
      },
    });
    createdRoles[roleName] = role;
    console.log(`Role ${roleName} seeded/verified.`);
  }

  // Common password hash (using bcryptjs)
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('Password123', saltRounds);

  // 2. Seed Admin User
  const adminEmail = 'admin@bookmyvenue.com';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      fullName: 'System Admin',
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'System Admin',
    },
  });
  console.log(`Admin user created/verified: ${adminEmail}`);

  // Link Admin to Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: createdRoles['ADMIN'].id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: createdRoles['ADMIN'].id,
    },
  });
  console.log(`Linked ${adminEmail} to ADMIN role.`);

  // 3. Seed Owner User
  const ownerEmail = 'owner@bookmyvenue.com';
  const ownerUser = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      passwordHash,
      fullName: 'Venue Owner',
    },
    create: {
      email: ownerEmail,
      passwordHash,
      fullName: 'Venue Owner',
    },
  });
  console.log(`Owner user created/verified: ${ownerEmail}`);

  // Link Owner to Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: ownerUser.id,
        roleId: createdRoles['OWNER'].id,
      },
    },
    update: {},
    create: {
      userId: ownerUser.id,
      roleId: createdRoles['OWNER'].id,
    },
  });
  console.log(`Linked ${ownerEmail} to OWNER role.`);

  // Create Owner Profile
  await prisma.ownerProfile.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      userId: ownerUser.id,
      phoneNumber: '1234567890',
      businessName: 'Premium Venues LLC',
      bankRoutingNumber: '123456789',
      bankAccountNumber: '987654321',
    },
  });
  console.log(`Created Owner Profile for ${ownerEmail}.`);

  // 4. Seed Regular User
  const userEmail = 'user@bookmyvenue.com';
  const regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      passwordHash,
      fullName: 'Regular User',
    },
    create: {
      email: userEmail,
      passwordHash,
      fullName: 'Regular User',
    },
  });
  console.log(`Regular user created/verified: ${userEmail}`);

  // Link Regular User to Role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: regularUser.id,
        roleId: createdRoles['USER'].id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      roleId: createdRoles['USER'].id,
    },
  });
  console.log(`Linked ${userEmail} to USER role.`);

  console.log('Database seeding completed successfully.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
