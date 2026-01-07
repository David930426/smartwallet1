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
          c.category_name as category,
          COALESCE(SUM(t.amount), 0) as amount
        FROM Categories c
        LEFT JOIN Transactions t ON c.category_id = t.category_id 
          AND t.user_id = @userId
          AND t.transaction_type = 'Expense'
        WHERE c.category_type = 'Expense'
        GROUP BY c.category_id, c.category_name
        ORDER BY amount DESC
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching category expenses:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}