import React from "react";

export type AtelierVariant =
  | "golden-hour"       // Warm amber, terracotta clay & olive sage (Workshops, Homepage)
  | "rose-velvet"       // Dusty rose, peach blossom & honey nectar (Bouquets)
  | "botanical-dusk"    // Deep forest moss, eucalyptus & dawn mist (About, Ethos)
  | "champagne-twilight" // Soft candlelight amber, dusky lilac & warm quartz (Contact)
  | "terracotta-earth"; // Warm terracotta bronze & baked ceramic (Collections)

export type AtelierPlacement =
  | "default"
  | "top-left"
  | "top-right"
  | "center"
  | "split";

interface AtelierRadialBackdropProps {
  children?: React.ReactNode;
  className?: string;
  variant?: AtelierVariant;
  placement?: AtelierPlacement;
  /**
   * Adds tactile fine 35mm film / handmade paper grain texture
   */
  withGrain?: boolean;
  /**
   * Intensity of the ambient glow (0.5 to 1.5)
   */
  intensity?: number;
}

export default function AtelierRadialBackdrop({
  children,
  className = "",
  variant = "golden-hour",
  placement = "default",
  withGrain = true,
  intensity = 1,
}: AtelierRadialBackdropProps) {
  // Gradients tailored specifically for an artisanal botanical atelier
  const getGradientConfig = () => {
    switch (variant) {
      case "rose-velvet": {
        // Bouquets: soft rose petal & peach blossom
        const isRight = placement === "top-right" || placement === "default";
        return {
          base: "#171215",
          light1: `radial-gradient(circle 650px at ${isRight ? "80% 20%" : "25% 25%"}, rgba(244, 63, 94, ${0.22 * intensity}), transparent 70%)`,
          light2: `radial-gradient(circle 520px at ${isRight ? "15% 80%" : "85% 75%"}, rgba(251, 146, 60, ${0.2 * intensity}), transparent 70%)`,
          light3: `radial-gradient(circle 420px at 50% 90%, rgba(244, 114, 182, ${0.16 * intensity}), transparent 70%)`,
          light4: `radial-gradient(ellipse 900px 350px at 80% 0%, rgba(253, 186, 116, ${0.12 * intensity}), transparent 60%)`,
          border: "rgba(244, 63, 94, 0.22)",
          ringColor: "ring-rose-500/15",
        };
      }

      case "terracotta-earth": {
        // Collections / Portfolio: warm bronze, terracotta & sunlit stone
        const isCenter = placement === "center" || placement === "default";
        return {
          base: "#151311",
          light1: `radial-gradient(circle ${isCenter ? "620px at 50% 30%" : "550px at 20% 20%"}, rgba(245, 158, 11, ${0.24 * intensity}), transparent 70%)`,
          light2: `radial-gradient(circle 500px at 80% 80%, rgba(217, 119, 6, ${0.22 * intensity}), transparent 70%)`,
          light3: `radial-gradient(circle 450px at 20% 85%, rgba(180, 83, 9, ${0.18 * intensity}), transparent 70%)`,
          light4: `radial-gradient(ellipse 850px 380px at 50% 0%, rgba(252, 211, 77, ${0.1 * intensity}), transparent 60%)`,
          border: "rgba(245, 158, 11, 0.22)",
          ringColor: "ring-amber-500/15",
        };
      }

      case "botanical-dusk": {
        // About / Philosophy: deep forest moss, tranquil sage & morning dawn
        const isCenter = placement === "center" || placement === "default";
        return {
          base: "#0e1612",
          light1: `radial-gradient(circle ${isCenter ? "650px at 50% 35%" : "600px at 20% 20%"}, rgba(34, 197, 94, ${0.18 * intensity}), transparent 70%)`,
          light2: `radial-gradient(circle 520px at 85% 75%, rgba(16, 185, 129, ${0.18 * intensity}), transparent 70%)`,
          light3: `radial-gradient(circle 450px at 15% 85%, rgba(245, 158, 11, ${0.14 * intensity}), transparent 70%)`,
          light4: `radial-gradient(ellipse 800px 350px at 50% 100%, rgba(52, 211, 153, ${0.12 * intensity}), transparent 60%)`,
          border: "rgba(52, 211, 153, 0.2)",
          ringColor: "ring-emerald-500/15",
        };
      }

      case "champagne-twilight": {
        // Contact: soft candlelight amber, lilac dusk & warm stone
        const isSplit = placement === "split" || placement === "default";
        return {
          base: "#141217",
          light1: `radial-gradient(circle 600px at ${isSplit ? "15% 25%" : "50% 30%"}, rgba(251, 191, 36, ${0.2 * intensity}), transparent 70%)`,
          light2: `radial-gradient(circle 550px at ${isSplit ? "85% 75%" : "80% 80%"}, rgba(168, 85, 247, ${0.18 * intensity}), transparent 70%)`,
          light3: `radial-gradient(circle 420px at 45% 85%, rgba(244, 63, 94, ${0.14 * intensity}), transparent 70%)`,
          light4: `radial-gradient(ellipse 700px 320px at 25% 0%, rgba(253, 230, 138, ${0.12 * intensity}), transparent 60%)`,
          border: "rgba(168, 85, 247, 0.2)",
          ringColor: "ring-purple-500/15",
        };
      }

      case "golden-hour":
      default: {
        // Workshops / Masterclasses: sun-drenched conservatory skylight
        const isTopLeft = placement === "top-left" || placement === "default";
        return {
          base: "#141210",
          light1: `radial-gradient(circle 620px at ${isTopLeft ? "15% 15%" : "50% 25%"}, rgba(245, 158, 11, ${0.22 * intensity}), transparent 70%)`,
          light2: `radial-gradient(circle 500px at ${isTopLeft ? "80% 85%" : "85% 80%"}, rgba(194, 89, 63, ${0.24 * intensity}), transparent 70%)`,
          light3: `radial-gradient(circle 420px at 30% 90%, rgba(45, 106, 79, ${0.16 * intensity}), transparent 70%)`,
          light4: `radial-gradient(ellipse 900px 400px at 50% 0%, rgba(251, 191, 36, ${0.09 * intensity}), transparent 60%)`,
          border: "rgba(245, 158, 11, 0.22)",
          ringColor: "ring-amber-500/15",
        };
      }
    }
  };

  const gradients = getGradientConfig();

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ${className}`}
      style={{
        backgroundColor: gradients.base,
        borderColor: gradients.border,
      }}
    >
      {/* 1. Volumetric Atelier Radial Light Layers */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700"
        style={{
          backgroundImage: `${gradients.light1}, ${gradients.light2}, ${gradients.light3}, ${gradients.light4}`,
        }}
        aria-hidden="true"
      />

      {/* 2. Tactile 35mm / Handcrafted Paper Grain Texture */}
      {withGrain && (
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
      )}

      {/* 3. Subtle Inner Vignette & Bevel Highlight */}
      <div
        className={`pointer-events-none absolute inset-0 z-0 ring-1 ring-inset ${gradients.ringColor} rounded-3xl`}
        aria-hidden="true"
      />

      {/* 4. Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
