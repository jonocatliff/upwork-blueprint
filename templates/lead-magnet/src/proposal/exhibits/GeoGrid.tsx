// The map ranking grid - LocalFalcon-style, same as the real Automatable
// audit exhibit: 25 points across the city, each badge a Google Maps API
// search from that spot. Green = top three, amber = ranked lower, red X =
// not returned within the checked depth.
import type { GeoGridExhibit } from "../types";
import { Alert, d } from "../ui";

type LocatedWinner = NonNullable<GeoGridExhibit["winners"]>[number] & {
  latitude?: number | null;
  longitude?: number | null;
};

function markerPosition(data: GeoGridExhibit, latitude: number, longitude: number) {
  const centre = (data as GeoGridExhibit & { centre?: [number, number] }).centre;
  if (!centre || !data.radiusKm) return null;
  const [centreLat, centreLng] = centre;
  const googleMap = data.mapImage?.startsWith("https://maps.googleapis.com/maps/api/staticmap?")
    ? new URL(data.mapImage) : null;
  const zoom = Number(googleMap?.searchParams.get("zoom"));
  const size = googleMap?.searchParams.get("size")?.split("x").map(Number);
  if (googleMap && Number.isFinite(zoom) && size?.length === 2 && size.every((value) => value > 0)) {
    // Static Maps scale=2 changes resolution, not the geographic viewport.
    const world = 256 * 2 ** zoom;
    const x = (lng: number) => (lng + 180) / 360 * world;
    const y = (lat: number) => (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2 * world;
    const left = 50 + (x(longitude) - x(centreLng)) / size[0] * 100;
    const top = 50 + (y(latitude) - y(centreLat)) / size[1] * 100;
    if (left < 2 || left > 98 || top < 2 || top > 98) return null;
    return { left: Number(left.toFixed(4)), top: Number(top.toFixed(4)) };
  }
  const halfLat = data.radiusKm * 1.3 / 111;
  const halfLng = halfLat / Math.max(Math.cos(centreLat * Math.PI / 180), 0.2);
  const mercatorY = (lat: number) => (1 - Math.asinh(Math.tan(lat * Math.PI / 180)) / Math.PI) / 2;
  const left = ((longitude - (centreLng - halfLng)) / (halfLng * 2)) * 100;
  const north = mercatorY(centreLat + halfLat);
  const south = mercatorY(centreLat - halfLat);
  const top = ((mercatorY(latitude) - north) / (south - north)) * 100;
  if (left < 2 || left > 98 || top < 2 || top > 98) return null;
  // Stable precision keeps React's server/client style serialization identical.
  return { left: Number(left.toFixed(4)), top: Number(top.toFixed(4)) };
}

function LocationPin({ left, top, label, mine, description }: { left: number; top: number; label: string; mine?: boolean; description: string }) {
  return (
    <span aria-label={description} title={description} style={{ position: "absolute", left: `${left}%`, top: `${top}%`, zIndex: 4, transform: "translate(-50%, -100%)", display: "grid", justifyItems: "center", filter: "drop-shadow(0 2px 3px rgba(15,23,42,.35))" }}>
      <span style={{ display: "grid", minWidth: mine ? 46 : 34, height: 34, padding: mine ? "0 8px" : 0, placeItems: "center", borderRadius: 999, border: "2.5px solid white", background: mine ? "#2448A8" : "#2f3540", color: "white", fontSize: mine ? 10 : 13, fontWeight: 900, letterSpacing: mine ? ".06em" : 0, lineHeight: 1 }}>
        {label}
      </span>
      <span aria-hidden style={{ width: 3, height: 8, background: mine ? "#2448A8" : "#2f3540", boxShadow: "0 0 0 1px white" }} />
    </span>
  );
}

function badge(rank: number | null): { bg: string; label: string } {
  if (typeof rank !== "number") return { bg: "rgba(181,51,51,.88)", label: "×" };
  if (rank <= 3) return { bg: "#2f7d4f", label: String(rank) };
  return { bg: "#d4a017", label: String(rank) };
}

/* `nackt` means: you are already inside a card, so do not draw a second one. */
export function GeoGrid({ data, showNote = true, nackt = false }: { data: GeoGridExhibit; showNote?: boolean; nackt?: boolean }) {
  if (!data.ranks) {
    return (
      <div style={{ margin: 0 }}>
        <Alert tone="info">{data.note}</Alert>
      </div>
    );
  }
  const inPack = data.ranks.filter((r) => typeof r === "number" && r <= 3).length;
  const missing = data.ranks.filter((r) => r === null).length;
  const centre = (data as GeoGridExhibit & { centre?: [number, number] }).centre;
  const locatedWinners = ((data.winners ?? []) as LocatedWinner[]).slice(0, 3).flatMap((winner, index) => {
    if (winner.latitude == null || winner.longitude == null) return [];
    const position = markerPosition(data, winner.latitude, winner.longitude);
    return position ? [{ ...winner, ...position, marker: index + 1 }] : [];
  });

  return (
    <div style={{ margin: 0 }}>
      <div className={nackt ? undefined : "pp-card"} style={{ padding: nackt ? 0 : 20 }}>
        <h3 className="m-0 text-[17px] font-black leading-[1.2] tracking-[-.02em] text-ink sm:text-lg">
          Where customers see you in Google Maps
        </h3>

        {/* THE SEARCH TERM BELONGS ABOVE THE MAP. The explanation
            below the map did name it, but whoever studies the dots never
            reads that far, and without the term a red grid asserts
            something about nothing. It now sits where the colours are. */}
        <p style={{ margin: "6px 0 12px", fontSize: 13, lineHeight: 1.4, color: "#4A4640" }}>
          Your position for <b style={{ color: "#1C160E" }}>&ldquo;{data.keyword}&rdquo;</b> across 25 locations
        </p>
        <div
          role="img"
          aria-label={`Map rank grid for ${data.keyword}: ${inPack} of 25 points in the top 3, ${missing} not returned in the checked results`}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 440,
            margin: "0 auto",
            aspectRatio: "1/1",
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid #E4E1D9",
            background: "#eef2ea",
          }}
        >
          {data.mapImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.mapImage} alt="" loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          ) : null}
          {data.attribution ? (
            <span style={{ position: "absolute", right: 4, bottom: 3, fontSize: 9, color: "#5f5d58", background: "rgba(255,255,255,.72)", padding: "1px 5px", borderRadius: 4, zIndex: 2 }}>
              {data.attribution}
            </span>
          ) : null}
          {data.ranks.map((r, i) => {
            const b = badge(r);
            const row = Math.floor(i / 5);
            const col = i % 5;
            const stepLat = data.radiusKm ? data.radiusKm / 111 / 2 : 0;
            const stepLng = centre && stepLat ? stepLat / Math.max(Math.cos(centre[0] * Math.PI / 180), 0.2) : 0;
            const point = centre && stepLat
              ? markerPosition(data, centre[0] + (2 - row) * stepLat, centre[1] + (col - 2) * stepLng)
              : null;
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${point?.left ?? 10 + col * 20}%`,
                  top: `${point?.top ?? 10 + row * 20}%`,
                  transform: "translate(-50%, -50%)",
                  width: "11%",
                  aspectRatio: "1/1",
                  borderRadius: 999,
                  background: b.bg,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: "0 1px 4px rgba(0,0,0,.35)",
                  outline: "2px solid rgba(255,255,255,.8)",
                }}
              >
                {b.label}
              </span>
            );
          })}
          {centre ? <LocationPin left={50} top={50} label="YOU" mine description="Your Google profile location" /> : null}
          {locatedWinners.map((winner) => (
            <LocationPin key={`${winner.name}-${winner.marker}`} left={winner.left} top={winner.top} label={String(winner.marker)} description={`${winner.marker}. ${winner.name}`} />
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 16px", marginTop: 14 }}>
          {[
            { c: "#2f7d4f", t: "Top 3" },
            { c: "#d4a017", t: "Ranked below 3" },
            { c: "rgba(181,51,51,.8)", t: "Not shown" },
          ].map((l) => (
            <span key={l.t} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono, monospace)", fontSize: 9, letterSpacing: "1px", textTransform: "uppercase", color: d.muted }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: l.c }} /> {l.t}
            </span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px", marginTop: 8, color: d.muted, fontSize: 10, fontWeight: 700 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ display: "grid", height: 18, minWidth: 28, placeItems: "center", borderRadius: 999, background: "#2448A8", color: "white", fontSize: 7, fontWeight: 900 }}>YOU</span>Your GBP location</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ display: "grid", width: 18, height: 18, placeItems: "center", borderRadius: 999, background: "#2f3540", color: "white", fontSize: 9, fontWeight: 900 }}>1</span>Competitor in the table</span>
        </div>

      </div>
      {data.demoLabel ? (
        <div style={{ marginTop: 12 }}>
          <Alert tone="caution">{data.demoLabel}</Alert>
        </div>
      ) : null}
      {showNote ? <p style={{ color: d.faint, fontSize: 13, margin: "12px 0 0" }}>{data.note}</p> : null}

    </div>
  );
}

/* HOW THIS MAP IS MADE, as a component of its own. It used to sit
 * below the heatmap, which put it in the narrow left column: four sentences
 * squeezed into 320 pixels while there was room to the right of them. The
 * report now renders it below both columns, across the full width. */
export function KarteErklaerung({ keyword }: { keyword: string }) {
  return (
    <details className="mt-5 border-t border-hairline pt-4">
      <summary className="flex min-h-11 cursor-pointer items-center text-[12px] font-black text-navy sm:min-h-0">Why your position changes across the area</summary>
      <ul className="m-0 mt-3 grid list-none gap-2.5 p-0 text-[13px] leading-[1.55] text-graphite sm:grid-cols-2 sm:gap-x-10">
        <li>Google gives a different answer depending on where the customer is standing.</li>
        <li>So we picked 25 spots across your area and ran the same search from each one.</li>
        <li>
          <b className="text-[#1a7f4b]">Green</b>{" means you were in the top three there, "}
          <b className="text-[#b07a1a]">amber</b>{" means further down the list, "}
          <b className="text-[#b03535]">red</b>{" means your listing was not returned in the checked results."}
        </li>
        <li>
          We searched for <b className="text-ink">&ldquo;{keyword}&rdquo;</b> without a town name, because that is what a customer actually types.
        </li>
      </ul>
    </details>
  );
}
