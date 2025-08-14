// app/plans/route.js
import { NextResponse } from "next/server";
import { getPlans } from "@/lib/api/plans";

export async function GET() {
  const plans = getPlans();
  return NextResponse.json(plans);
}
