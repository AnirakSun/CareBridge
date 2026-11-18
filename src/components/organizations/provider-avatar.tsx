import Image from "next/image";
import { photoUrlForProvider } from "@/lib/provider-photos";

export function ProviderAvatar({
  name,
  photoUrl,
  size = 72,
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
}) {
  const src = photoUrl ?? photoUrlForProvider(name);

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        sizes={`${size}px`}
      />
      <span className="sr-only">Portrait of {name}</span>
    </div>
  );
}