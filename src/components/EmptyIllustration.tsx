"use client";
type Variant = "products" | "orders" | "store" | "promo" | "generic";

function BaseHill({ children }: { children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 680 260" className="w-full h-auto max-w-[420px] mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
      <circle cx="250" cy="42" r="38" fill="#E6F5DD" stroke="#1A3D2E" strokeWidth="1.4" />
      <circle cx="308" cy="68" r="7.5" fill="white" stroke="#1A3D2E" strokeWidth="1.4" />
      <g stroke="#1A3D2E" strokeWidth="1.3" strokeLinecap="round">
        <path d="M520 28 H548 M534 14 V42" />
      </g>
      <g stroke="#1A3D2E" strokeWidth="1.2" fill="none">
        <path d="M565 98 L580 118 L565 138 L550 118 Z" />
        <path d="M565 102 L576 118 L565 134 L554 118 Z" opacity="0.45" />
      </g>
      <path d="M-10 225 C140 150 420 150 690 225 L690 260 L-10 260 Z" fill="#F9F1D9" stroke="#1A3D2E" strokeWidth="1.5" />
      <g transform="translate(625, 198)">
        <circle cx="0" cy="0" r="13.5" fill="#EAF6E3" stroke="#1A3D2E" strokeWidth="1.4" />
        <path d="M0 13.5 C0 24 3 35 8 44" stroke="#1A3D2E" strokeWidth="1.4" fill="none" />
        <path d="M8 44 C14 36 18 24 11 18 C4 14 0 20 2 28 Z" fill="#0F7A4A" stroke="#1A3D2E" strokeWidth="1.2" />
      </g>
      <g>
        <path d="M72 196 L58 202 L54 192 L66 188 Z" fill="white" stroke="#1A3D2E" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M72 196 C95 188 128 178 152 168 C165 162 178 158 192 152" fill="#DFF0D0" stroke="#1A3D2E" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M192 152 C202 148 212 150 218 158 L238 184 L258 188 L245 200 L210 200 C190 190 150 188 110 196 Z" fill="#DFF0D0" stroke="#1A3D2E" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M238 184 C248 170 260 142 250 124 C245 115 232 112 225 122 C218 135 210 155 210 170 Z" fill="#DFF0D0" stroke="#1A3D2E" strokeWidth="1.4" />
        <ellipse cx="250" cy="84" rx="24" ry="23" fill="#C8E9B8" stroke="#1A3D2E" strokeWidth="1.4" />
        <path d="M228 88 C215 96 212 112 225 124 L235 120 C232 112 234 102 242 94" fill="white" stroke="#1A3D2E" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M233 112 L238 135 L258 142 L275 168 L305 180" fill="#0F7A4A" stroke="#1A3D2E" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M258 142 C270 148 285 156 305 180" stroke="#1A3D2E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M305 180 C312 184 318 186 325 188" stroke="#1A3D2E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </g>
      {children}
    </svg>
  );
}

function Badge({ icon }: { icon: React.ReactNode }) {
  return (
    <g>
      <circle cx="338" cy="58" r="18" fill="white" stroke="#1A3D2E" strokeWidth="1.4" />
      <g transform="translate(338,58) translate(-10,-10)">{icon}</g>
    </g>
  );
}

export function EmptyIllustration({ variant = "generic", className }: { variant?: Variant; className?: string }) {
  return (
    <div className={className}>
      <BaseHill>
        {variant === "products" && (
          <Badge icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.6"><path d="M6 7 L18 7 L17 19 L7 19 Z" /><path d="M9 7 V5 A3 3 0 0 1 15 5 V7" /></svg>} />
        )}
        {variant === "orders" && (
          <Badge icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.6"><rect x="3" y="5" width="18" height="12" rx="1.5" /><path d="M3 7 L12 12 L21 7" /></svg>} />
        )}
        {variant === "promo" && (
          <Badge icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.6"><path d="M12 3 L15.5 8.5 L21 9 L16.5 13.5 L17.5 19 L12 16 L6.5 19 L7.5 13.5 L3 9 L8.5 8.5 Z" /></svg>} />
        )}
        {variant === "store" && (
          <Badge icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0F7A4A" strokeWidth="1.6"><path d="M3 9 L12 3 L21 9 V19 H3 Z" /><path d="M9 19 V12 H15 V19" /></svg>} />
        )}
      </BaseHill>
    </div>
  );
}
