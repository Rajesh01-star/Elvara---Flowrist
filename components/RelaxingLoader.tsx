"use client";

import Image from "next/image";

interface RelaxingLoaderProps {
  label?: string;
  size?: number;
  className?: string;
}

export default function RelaxingLoader({
  label = "Curating botanical blooms...",
  size = 140,
  className = "",
}: RelaxingLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative rounded-3xl overflow-hidden bg-white/60 p-2 shadow-xs border border-stone-200/50">
        <Image
          src="/animations/TotoroWalk.gif"
          alt="Loading flowers..."
          width={size}
          height={size}
          unoptimized
          className="rounded-2xl object-cover"
          priority
        />
      </div>
      {label && (
        <p className="mt-4 font-serif text-sm text-stone-600 tracking-wide font-normal animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
}
