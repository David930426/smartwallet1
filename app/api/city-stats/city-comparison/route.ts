import { NextResponse } from "next/server";
import { DbConnect } from "@/lib/db";

export async function GET() {
  try {
    const pool = await DbConnect();
    const result = await pool.request()
      .query(`
        SELECT 
          city_name as name,
          cost_of_living as amount
        FROM City
        ORDER BY cost_of_living DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching city comparison:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}