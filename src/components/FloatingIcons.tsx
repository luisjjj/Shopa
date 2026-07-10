"use client";

const icons = [
  // Shopping bag
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  // Shopping cart
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  // Store / shop front
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  // Price tag
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
  // Wallet / payment
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  // Smartphone (for mobile sellers)
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  // Link / bio link
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  // Star
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  // Heart / favorites
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  // Box / package
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  // Credit card / payment
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  // Globe / online store
  (size: number) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
];

// Deterministic positions for the icons
const placements = [
  { x: 5, y: 8, size: 32, rotation: -15, delay: 0, duration: 18 },
  { x: 88, y: 5, size: 28, rotation: 20, delay: 2, duration: 22 },
  { x: 15, y: 35, size: 36, rotation: 10, delay: 4, duration: 20 },
  { x: 75, y: 25, size: 24, rotation: -25, delay: 1, duration: 24 },
  { x: 45, y: 12, size: 30, rotation: 30, delay: 3, duration: 19 },
  { x: 92, y: 45, size: 26, rotation: -10, delay: 5, duration: 21 },
  { x: 8, y: 65, size: 34, rotation: 15, delay: 2.5, duration: 23 },
  { x: 60, y: 55, size: 22, rotation: -20, delay: 0.5, duration: 17 },
  { x: 30, y: 75, size: 28, rotation: 5, delay: 3.5, duration: 25 },
  { x: 80, y: 70, size: 32, rotation: -30, delay: 1.5, duration: 20 },
  { x: 50, y: 85, size: 26, rotation: 25, delay: 4.5, duration: 22 },
  { x: 20, y: 90, size: 24, rotation: -5, delay: 2, duration: 18 },
  { x: 70, y: 92, size: 30, rotation: 12, delay: 0, duration: 21 },
  { x: 40, y: 45, size: 20, rotation: -18, delay: 3, duration: 26 },
  { x: 55, y: 30, size: 22, rotation: 8, delay: 1, duration: 19 },
  { x: 12, y: 50, size: 18, rotation: -12, delay: 4, duration: 24 },
  { x: 85, y: 55, size: 28, rotation: 22, delay: 2.5, duration: 20 },
  { x: 35, y: 20, size: 20, rotation: -8, delay: 0.5, duration: 23 },
];

export default function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {placements.map((pos, i) => {
        const Icon = icons[i % icons.length];
        return (
          <div
            key={i}
            className="absolute text-brand-400/[0.07]"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `rotate(${pos.rotation}deg)`,
              animation: `iconFloat ${pos.duration}s ease-in-out ${pos.delay}s infinite`,
            }}
          >
            {Icon(pos.size)}
          </div>
        );
      })}
    </div>
  );
}
