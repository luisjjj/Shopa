type ShopaMarkProps = {
  className?: string;
  title?: string;
};

/** The Shopa mark: two connected storefront awnings forming an S. */
export function ShopaMark({ className, title }: ShopaMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shopa-mark-gradient" x1="8" y1="6" x2="40" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F49A35" />
          <stop offset="1" stopColor="#D95012" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#shopa-mark-gradient)" />
      <path d="M34.5 14.5C31.6 12.5 28.2 11.5 24.2 11.5C17.7 11.5 13.5 14.1 13.5 18.1C13.5 25 34.5 21.1 34.5 29.2C34.5 33.6 30.3 36.5 23.7 36.5C19.4 36.5 15.7 35.2 13 32.8" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <path d="M17.8 15.4L14.1 12.1M30.3 35.1L34 38.4" stroke="#FFE1B4" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

type ShopaLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  size?: number;
};

export function ShopaLogo({
  className = "",
  markClassName = "",
  textClassName = "",
  size = 32,
}: ShopaLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <ShopaMark className={`shrink-0 ${markClassName}`} />
      <span className={textClassName} style={{ fontSize: size * 0.68 }}>
        Shopa
      </span>
    </span>
  );
}
