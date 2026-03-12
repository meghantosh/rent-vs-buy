import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalculatorPage } from "@/components/calculator/calculator-page";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <CalculatorPage />;
}
