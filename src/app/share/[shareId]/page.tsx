import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedCalculatorView } from "@/components/calculator/shared-view";
import { computeResults } from "@/lib/calculator/engine";
import { computeVerdict } from "@/lib/calculator/verdict";
import type { CalculatorInputs } from "@/lib/calculator/types";
import { getSharedCalculation } from "./shared-data";

interface Props {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const row = await getSharedCalculation(shareId);

  if (!row) {
    return { title: "Calculation Not Found" };
  }

  const results = computeResults(row.inputs as CalculatorInputs);
  const verdict = computeVerdict(results);

  const title = row.name || "Rent vs Buy Calculation";
  const description = verdict.text;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/share/${shareId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: description,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedCalculationPage({ params }: Props) {
  const { shareId } = await params;
  const row = await getSharedCalculation(shareId);

  if (!row) {
    notFound();
  }

  return (
    <SharedCalculatorView
      name={row.name}
      inputs={row.inputs as never}
      authorName={row.userName}
    />
  );
}
