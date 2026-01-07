import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import { Category, ApiResponse } from "@/index";

// GET /api/categories - Get all categories (with optional type filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'income' or 'expense'

    const pool = await getConnection();
    const req = pool.request();

    let query = "SELECT * FROM Categories WHERE 1=1";

    if (type && ["income", "expense"].includes(type)) {
      query += " AND category_type = @type";
      req.input("type", sql.VarChar, type);
    }

    query += " ORDER BY category_name";

    const result = await req.query<Category>(query);

    const response: ApiResponse<Category[]> = {
      success: true,
      data: result.recordset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_name, category_type, icon } = body;

    if (!category_name || !category_type) {
      return NextResponse.json(
        { success: false, error: "Category name and type are required" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(category_type)) {
      return NextResponse.json(
        { success: false, error: "Invalid category type" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("categoryName", sql.NVarChar(50), category_name)
      .input("categoryType", sql.VarChar(10), category_type)
      .input("icon", sql.NVarChar(50), icon || "💰")
      .query<Category>(`
        INSERT INTO Categories (category_name, category_type, icon)
        OUTPUT INSERTED.*
        VALUES (@categoryName, @categoryType, @icon)
      `);

    return NextResponse.json(
      { success: true, data: result.recordset[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}