"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapPin, Users, Star } from "lucide-react";
import Image from "next/image";

import { Venue } from "@/lib/venues/data";
import { formatVenuePrice } from "@/lib/venues/listing";

// Fix Leaflet default icon issue in Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface VenueMapProps {
  venues: Venue[];
  center?: [number, number];
  zoom?: number;
}

// Component to dynamically update map bounds to fit all markers
function MapBounds({ venues }: { venues: Venue[] }) {
  const map = useMap();

  useEffect(() => {
    if (!venues || venues.length === 0) return;

    const validVenues = venues.filter((v) => v.latitude && v.longitude);
    if (validVenues.length === 0) return;

    const bounds = L.latLngBounds(
      validVenues.map((v) => [v.latitude as number, v.longitude as number])
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [map, venues]);

  return null;
}

export default function VenueMap({ venues, center = [20.5937, 78.9629], zoom = 5 }: VenueMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-surface-container-low animate-pulse rounded-2xl"></div>;

  const validVenues = venues.filter((v) => v.latitude && v.longitude);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-border-subtle shadow-sm z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validVenues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude as number, venue.longitude as number]}
            icon={customIcon}
          >
            <Popup className="venue-popup" minWidth={250}>
              <div className="flex flex-col gap-2">
                <div className="relative h-32 w-full overflow-hidden rounded-lg">
                  <Image
                    src={venue.images.main}
                    alt={venue.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface line-clamp-1">{venue.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-on-surface">{venue.rating.toFixed(1)}</span>
                    <span className="mx-1">•</span>
                    <Users className="h-3 w-3" />
                    <span>{venue.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">{venue.city}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-primary-container text-sm">
                      {formatVenuePrice(venue.pricePerDay)}/day
                    </span>
                    <Link
                      href={`/venues/${venue.id}`}
                      className="rounded-full bg-primary-container px-3 py-1 text-xs font-bold text-white hover:bg-primary-container/90"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapBounds venues={validVenues} />
      </MapContainer>

      {/* Global styles for popup to reset Leaflet defaults */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
        }
        .leaflet-popup-content {
          margin: 12px;
          line-height: normal;
        }
      `}</style>
    </div>
  );
}
