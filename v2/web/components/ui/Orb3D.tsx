import React from "react";
import { cn } from "@/lib/utils";

interface Orb3DProps {
  className?: string;
  size?: number;
  pulsing?: boolean;
}

export const Orb3D: React.FC<Orb3DProps> = ({
  className,
  size = 88,
  pulsing = false,
}) => {
  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-[24px] pointer-events-none transition-all duration-700",
          pulsing ? "bg-signal/50 scale-125" : "bg-cyan-500/25 scale-100"
        )}
      />

      {/* SVG Multi-Layered 3D Iridescent Orb */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "relative z-10 transition-transform duration-500 hover:scale-105",
          pulsing && "animate-pulse"
        )}
      >
        <defs>
          {/* Main sphere gradient */}
          <radialGradient
            id="orb-base"
            cx="40%"
            cy="35%"
            r="65%"
            fx="35%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="25%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="85%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Liquid internal swirl gradient */}
          <linearGradient id="orb-swirl" x1="15%" y1="15%" x2="85%" y2="85%">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#0284C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.9" />
          </linearGradient>

          {/* Top-left specular gloss highlight */}
          <radialGradient
            id="orb-specular"
            cx="35%"
            cy="28%"
            r="35%"
            fx="35%"
            fy="25%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#E0F2FE" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </radialGradient>

          {/* Bottom rim light */}
          <linearGradient id="orb-rim" x1="50%" y1="70%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Base dark orb shell */}
        <circle cx="50" cy="50" r="46" fill="url(#orb-base)" />

        {/* Inner dynamic iridescent swirl */}
        <path
          d="M 22 55 C 26 30, 70 25, 78 48 C 84 65, 45 78, 30 72 C 18 67, 18 62, 22 55 Z"
          fill="url(#orb-swirl)"
          opacity="0.85"
        />

        {/* Secondary internal counter-wave */}
        <path
          d="M 32 36 C 45 28, 75 35, 72 56 C 70 68, 52 74, 38 68 C 26 62, 24 42, 32 36 Z"
          fill="#38BDF8"
          opacity="0.4"
          filter="blur(2px)"
        />

        {/* Bottom rim edge illumination */}
        <circle cx="50" cy="50" r="45" stroke="url(#orb-rim)" strokeWidth="2" fill="none" />

        {/* Top-left bright specular highlight reflection */}
        <ellipse
          cx="38"
          cy="32"
          rx="22"
          ry="15"
          transform="rotate(-25 38 32)"
          fill="url(#orb-specular)"
        />

        {/* Pinpoint bright glint */}
        <circle cx="34" cy="27" r="3.5" fill="#FFFFFF" opacity="0.9" filter="blur(0.5px)" />
      </svg>
    </div>
  );
};