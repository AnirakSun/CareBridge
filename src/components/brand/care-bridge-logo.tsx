import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
};

/** Bridge formed from stacked clinical paper sheets. */
export function CareBridgeLogo({ className, title = "CareBridge" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn("h-6 w-6 shrink-0", className)}
    >
      <title>{title}</title>
      {/* water */}
      <path
        d="M3 40.5h42"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        className="text-blue-300"
      />
      {/* left pier — paper stack */}
      <rect x="4" y="32" width="11" height="8" rx="1.2" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.2" />
      <rect x="5.5" y="28.5" width="11" height="8" rx="1.2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.2" />
      <rect x="7" y="25" width="11" height="8" rx="1.2" fill="#fff" stroke="#1e40af" strokeWidth="1.2" />
      <path d="M9 27.5h6M9 29.5h5M9 31h4" stroke="#94a3b8" strokeWidth="0.75" strokeLinecap="round" />
      {/* right pier */}
      <rect x="33" y="32" width="11" height="8" rx="1.2" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="1.2" />
      <rect x="31.5" y="28.5" width="11" height="8" rx="1.2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.2" />
      <rect x="30" y="25" width="11" height="8" rx="1.2" fill="#fff" stroke="#1e40af" strokeWidth="1.2" />
      <path d="M32 27.5h6M32 29.5h5M32 31h4" stroke="#94a3b8" strokeWidth="0.75" strokeLinecap="round" />
      {/* arch span — paper sheets forming the bridge */}
      <g stroke="#1e40af" strokeWidth="1.15">
        <rect
          x="15"
          y="30.5"
          width="7"
          height="9"
          rx="1"
          fill="#fff"
          transform="rotate(-28 18.5 35)"
        />
        <rect
          x="19"
          y="24"
          width="7"
          height="9"
          rx="1"
          fill="#eff6ff"
          transform="rotate(-14 22.5 28.5)"
        />
        <rect x="21.5" y="17.5" width="7" height="9" rx="1" fill="#fff" />
        <rect
          x="24"
          y="24"
          width="7"
          height="9"
          rx="1"
          fill="#eff6ff"
          transform="rotate(14 27.5 28.5)"
        />
        <rect
          x="26"
          y="30.5"
          width="7"
          height="9"
          rx="1"
          fill="#fff"
          transform="rotate(28 29.5 35)"
        />
      </g>
      <path d="M23.5 17.5l2 2h-2v-2z" fill="#dbeafe" />
      <path d="M16 31l1.8 1.5M30.5 31l-1.8 1.5" stroke="#2563eb" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}