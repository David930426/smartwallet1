import { NextResponse } from "next/server";
import { DbConnect } from "@/lib/db";
import sql from "mssql";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const user = cookieStore.get("userId");

    if (!user?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = await DbConnect();
    const result = await pool.request()
      .input("userId", sql.NVarChar, user.value)
      .query(`
        SELECT 
          u.user_id,
          u.username,
          u.email,
          c.city_name
        FROM Users u
        LEFT JOIN City c ON u.city_id = c.city_id
        WHERE u.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}