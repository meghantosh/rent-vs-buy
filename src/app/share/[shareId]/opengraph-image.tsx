import { ImageResponse } from "next/og";
import { computeResults } from "@/lib/calculator/engine";
import { computeVerdict } from "@/lib/calculator/verdict";
import type { CalculatorInputs } from "@/lib/calculator/types";
import { getSharedCalculation } from "./shared-data";

export const revalidate = 3600;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

import { RENT_COLOR, BUY_COLORS as COLORS } from "@/lib/chart-colors";

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const row = await getSharedCalculation(shareId);

  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  const [dmSansFont, ibmPlexSerifBold] = await Promise.all([
    fetch("https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriCZOIHTWEBlw.ttf").then((res) => res.arrayBuffer()),
    fetch("https://fonts.gstatic.com/s/ibmplexserif/v19/jizAREVNn1dOx-zrZ2X3pZvkTiUa4442q1I.ttf").then((res) => res.arrayBuffer()),
  ]);

  const results = computeResults(row.inputs as CalculatorInputs);
  const verdict = computeVerdict(results);
  const snap = results.yearSnapshots[9]; // Year 10

  const bars = [
    { name: "Rent", wealth: Math.round(snap.rent.totalWealth), color: RENT_COLOR },
    ...snap.buy.map((b, i) => ({
      name: results.scenarios[i].label,
      wealth: Math.round(b.totalWealth),
      color: COLORS[i % COLORS.length],
    })),
  ];

  const maxWealth = Math.max(...bars.map((b) => b.wealth), 1);
  const maxBarHeight = 280;
  const calcName = row.name.length > 40 ? row.name.slice(0, 37) + "..." : row.name;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "40px 60px",
          fontFamily: "DM Sans",
        }}
      >
        {/* Verdict headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#1a1a1a",
              textAlign: "center",
              fontFamily: "IBM Plex Serif",
            }}
          >
            {verdict.text}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#6b7280",
            }}
          >
            {calcName}
          </div>
        </div>

        {/* Bar chart */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "16px",
            height: `${maxBarHeight + 60}px`,
          }}
        >
          {bars.map((bar) => {
            const barHeight = Math.max(
              8,
              Math.round((bar.wealth / maxWealth) * maxBarHeight)
            );
            return (
              <div
                key={bar.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {/* Value label */}
                <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                  {fmtK(bar.wealth)}
                </div>
                {/* Bar */}
                <div
                  style={{
                    width: "110px",
                    height: `${barHeight}px`,
                    backgroundColor: bar.color,
                    borderRadius: "6px 6px 0 0",
                    opacity: bar.wealth === maxWealth ? 1 : 0.7,
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    fontSize: 13,
                    color: "#374151",
                    textAlign: "center",
                    width: "110px",
                  }}
                >
                  {bar.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Branding */}
        <div style={{ fontSize: 16, color: "#9ca3af" }}>
          Rent vs Buy Calculator
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "DM Sans", data: dmSansFont, weight: 400 },
        { name: "IBM Plex Serif", data: ibmPlexSerifBold, weight: 700 },
      ],
    }
  );
}
