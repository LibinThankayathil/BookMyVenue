"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function NotFound() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate rotation for 3D effect
  const calculateTransform = () => {
    if (!containerRef.current) return "rotateX(0deg) rotateY(0deg)";
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = -((mousePosition.y - centerY) / centerY) * 10;
    const rotateY = ((mousePosition.x - centerX) / centerX) * 10;
    
    return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center overflow-hidden"
    >
      {/* Interactive flashlight effect background */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, color-mix(in oklab, var(--primary-container) 15%, transparent), transparent 40%)`,
        }}
      />
      
      {/* Noise overlay for texture */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}>
      </div>

      <div 
        className="relative z-10 space-y-8 max-w-md transition-transform duration-200 ease-out"
        style={{ transform: calculateTransform() }}
      >
        <div className="relative">
          <h1 className="text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container drop-shadow-xl select-none" style={{ fontSize: '10rem', lineHeight: '1' }}>
            404
          </h1>
          {/* Subtle reflection */}
          <h1 className="absolute top-0 left-0 w-full text-9xl font-bold tracking-tighter text-primary-container/20 blur-xl -z-10 select-none" style={{ fontSize: '10rem', lineHeight: '1', transform: 'translateY(10px)' }}>
            404
          </h1>
        </div>
        
        <div className="space-y-4 rounded-3xl p-8 glass-card shadow-elevation-card border-outline-variant/30 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
            Lost in Space
          </h2>
          <p className="text-text-muted text-body-lg">
            Sorry, we couldn't find the page you're looking for. It might have been moved to another universe.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/"
              className="group/btn flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-6 py-3 text-label-md font-bold text-on-primary-container hover:bg-primary sm:w-auto transition-all shadow-md hover:shadow-elevation-card hover:-translate-y-1"
            >
              <Home className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
              <span>Go Home</span>
            </Link>
            
            <button
              onClick={() => router.back()}
              className="group/btn flex w-full items-center justify-center gap-2 rounded-full border-2 border-outline-variant bg-surface px-6 py-3 text-label-md font-bold text-on-surface hover:bg-surface-container-low hover:border-primary-container/50 sm:w-auto transition-all hover:-translate-y-1"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover/btn:-translate-x-1" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
