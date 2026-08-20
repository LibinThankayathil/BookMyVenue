# BookMyVenue (by WeCode)

BookMyVenue is a 100% open-source initiative built by the **WeCode community**, designed to simplify the process of finding and booking venues in local areas. This is a platform built for the community, by the community. Whether you're looking for a cozy cafe for a quick meetup, a spacious auditorium for a community event, or a scenic outdoor space for a personal celebration, BookMyVenue aims to connect people with the perfect space—without the commercial overhead.

## 🚧 The Problem

Organizing an event—big or small—often comes with the hassle of finding a suitable location. Traditionally, people struggle with:

- **Fragmented Information:** Venue details, availability, and pricing are scattered across various websites or require time-consuming phone calls.
- **Lack of Transparency:** Hidden costs, unclear amenities, and outdated photos make it hard to trust what you are booking.
- **Time Inefficiency:** Manually comparing options, negotiating, and finalizing bookings is a tedious and frustrating process for organizers.
- **Underutilized Spaces:** Owners of small or unique spaces (like local cafes, art studios, or boutique halls) often lack the marketing reach to showcase their venues to a wider audience.

## 💡 The Solution

BookMyVenue acts as a completely free and open bridge between space owners and the community, offering a seamless booking experience for everyone:

- **Centralized Marketplace:** A single platform to discover a wide variety of venues, ranging from conventional banquet halls and auditoriums to unconventional spaces like cafes, studios, and mall pop-up spaces.
- **Real-Time Availability & Pricing:** Transparent access to schedules and upfront pricing so you can make informed decisions quickly without the back-and-forth.
- **Detailed Listings:** High-quality photos, comprehensive amenity lists (e.g., Wi-Fi, parking, AV equipment), and verified user reviews.
- **Simplified Booking Process:** Easy, hassle-free online reservations in just a few clicks.
- **Empowering Local Communities:** Providing small venue owners, community centers, and local spaces an open platform to manage their underutilized spaces and share them with the public.

## 🗺️ Project Roadmap

We are building BookMyVenue iteratively through **4 Phases**:
- **Phase 1: MVP (Current):** Anyone can contribute in *any stack*. If it's good, we merge it!
- **Phase 2 & 3: Feature & Modularization:** Implementing features module by module and refining the architecture.
- **Phase 4: Scalability:** Building a fully scalable, cloud-native solution for high traffic.

## 🤝 How to Contribute

This is a collective effort, and everyone in the WeCode community shares the benefits of what we build! Whether you're a beginner or a pro, we would love your help. 
Please check out our full [Contribution Guidelines](CONTRIBUTING.md) to learn how to:
- Fork and clone the repository.
- Create your feature branch (`feat/<branch-name>`).
- Submit a Pull Request.

### 📝 Pull Request Format
To maintain a high standard of code, all Pull Requests must use our [standard template](.github/PULL_REQUEST_TEMPLATE.md). When you open a PR, you will be prompted to:
1. **Select the Phase Category** (e.g., Phase 1 MVP).
2. **Document your Tech Stack** (Frontend, Backend, Database).
3. **Complete the Review Checklist** (Self-review, community standards).
4. **Sign the AI Disclosure** (Confirming you have reviewed any AI-generated code).
5. **Attach Screenshots** (If your PR includes UI changes).

**BookMyVenue belongs to all of us. Join WeCode today and let's build something amazing together!**

---

## 🛠️ Development Setup Guide

You can develop BookMyVenue using either **Docker-based workflow (Recommended)** or a **Local development workflow** (running databases in Docker and service code locally).

Both workflows require creating a `.env` file inside each microservice directory:
- `services/api-gateway/.env`
- `services/auth-service/.env`
- `services/venue-service/.env`
- `services/booking-service/.env`

#### Key `.env` File Configurations

1. **`services/api-gateway/.env`**
   ```env
   PORT=8000
   JWT_SECRET=secret
   AUTH_SERVICE_URL=http://localhost:5003
   VENUE_SERVICE_URL=http://localhost:5001
   BOOKING_SERVICE_URL=http://localhost:5002
   ```

2. **`services/auth-service/.env`**
   ```env
   PORT=5003
   DATABASE_URL=postgres://bmv_dev_user:bmv_ssh@localhost:5432/bmv_auth
   JWT_SECRET=secret
   JWT_EXPIRES_IN=24h
   POSTGRES_USER=bmv_dev_user
   POSTGRES_PASSWORD=bmv_ssh
   POSTGRES_DB=bmv_db
   ```

3. **`services/venue-service/.env`**
   ```env
   PORT=5001
   DATABASE_URL=postgres://bmv_dev_user:bmv_ssh@localhost:5432/bmv_venue
   ```

4. **`services/booking-service/.env`**
   ```env
   PORT=5002
   DATABASE_URL=postgres://bmv_dev_user:bmv_ssh@localhost:5432/bmv_booking
   ```

*(Note: The `localhost` hostnames inside these `.env` files are used directly when running services locally. When running inside Docker containers, the application config loaders automatically detect the container environment and resolve `localhost` coordinates to their corresponding internal container hostnames (`bmv_db`, `auth-service`, `venue-service`, `booking-service`)).*

---

### 🐳 Workflow A: Docker-based Development (Primary)

This workflow runs the entire service mesh (Postgres Database, API Gateway, Front-end, and all microservices) in Docker containers.

#### Prerequisites
- Docker & Docker Compose installed.
- Created the 4 service `.env` files as detailed above.

#### Steps
1. **Start the complete mesh:**
   ```bash
   docker compose up --build
   ```
2. **Accessing services:**
   - **Frontend UI:** `http://localhost:3000`
   - **API Gateway proxy:** `http://localhost:8000`
3. **Database Ports:**
   - Postgres remains exposed on host port `5432` for GUI management/inspection.

---

### 💻 Workflow B: Local Development (Secondary)

If you prefer to debug Node.js code locally without container rebuild overhead, you can run the services on your host machine while keeping the relational database container running.

#### Prerequisites
- Node.js (version 20 or higher is recommended) & npm installed.
- Created the 4 service `.env` files as detailed above.

#### Steps

1. **Start only the Database container:**
   ```bash
   docker compose up -d bmv_db
   ```
   This spins up PostgreSQL on port `5432` with multiple database schemas (`bmv_auth`, `bmv_venue`, `bmv_booking`) using the configurations from `services/auth-service/.env`.

2. **Install Dependencies & Generate Prisma Clients:**
   Inside each service directory, run dependency installation and client generation:
   ```bash
   # In services/auth-service, services/venue-service, services/booking-service
   npm install
   npx prisma generate
   ```

3. **Launch the services:**
   Open separate terminal windows and run `start:dev` inside each service folder:
   ```bash
   # In services/api-gateway
   npm run start:dev # (Launches HTTP Gateway on port 8000)

   # In services/auth-service
   npm run start:dev # (Launches Auth Service on port 5003)

   # In services/venue-service
   npm run start:dev # (Launches Venue Service on port 5001)

   # In services/booking-service
   npm run start:dev # (Launches Booking Service on port 5002)
   ```
   Now you can hit `http://localhost:8000/health` or `http://localhost:8000/api/...` locally, and the API gateway will route directly to your local service instances.

