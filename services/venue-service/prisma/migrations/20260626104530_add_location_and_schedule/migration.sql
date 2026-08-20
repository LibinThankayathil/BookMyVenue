-- CreateEnum
CREATE TYPE "VenueStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('PER_HOUR', 'PER_SESSION');

-- CreateEnum
CREATE TYPE "ClosureType" AS ENUM ('MAINTENANCE', 'HOLIDAY', 'PRIVATE_EVENT');

-- CreateTable
CREATE TABLE "venues" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "pricingType" "PricingType" NOT NULL DEFAULT 'PER_HOUR',
    "bufferTimeMinutes" INTEGER NOT NULL DEFAULT 60,
    "status" "VenueStatus" NOT NULL DEFAULT 'PENDING',
    "imageUrls" TEXT[],
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "operatingDays" TEXT[],
    "openingTime" TEXT,
    "closingTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amenities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "iconKey" TEXT,

    CONSTRAINT "amenities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_amenities" (
    "venueId" INTEGER NOT NULL,
    "amenityId" INTEGER NOT NULL,

    CONSTRAINT "venue_amenities_pkey" PRIMARY KEY ("venueId","amenityId")
);

-- CreateTable
CREATE TABLE "venue_capacities" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "maxPeople" INTEGER NOT NULL,
    "isSeparate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "venue_capacities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_sessions" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "sessionPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "venue_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_closures" (
    "id" SERIAL NOT NULL,
    "venueId" INTEGER NOT NULL,
    "type" "ClosureType" NOT NULL DEFAULT 'MAINTENANCE',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "venue_closures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "amenities_name_key" ON "amenities"("name");

-- CreateIndex
CREATE INDEX "venue_closures_venueId_startTime_endTime_idx" ON "venue_closures"("venueId", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "venue_amenities" ADD CONSTRAINT "venue_amenities_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_amenities" ADD CONSTRAINT "venue_amenities_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "amenities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_capacities" ADD CONSTRAINT "venue_capacities_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_sessions" ADD CONSTRAINT "venue_sessions_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_closures" ADD CONSTRAINT "venue_closures_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
