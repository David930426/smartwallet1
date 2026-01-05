import { getCityComparison } from "@/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const data = await getCityComparison();
        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}