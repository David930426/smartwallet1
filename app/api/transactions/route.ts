import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import {
  Transaction,
  TransactionWithCategory,
  CreateTransactionRequest,
  ApiResponse,
} from "@/index";

// GET /api/transactions - Get all transactions (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const type = searchParams.get("type"); // 'income' or 'expense'
    const limit = searchParams.get("limit") || "20";
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const pool = await getConnection();
    const req = pool.request();

    let query = `
      SELECT 
        t.transaction_id,
        t.user_id,
        t.category_id,
        t.amount,
        t.transaction_type,
        t.transaction_date,
        t.description,
        t.created_at,
        c.category_name,
        c.icon
      FROM Transactions t
      INNER JOIN Categories c ON t.category_id = c.category_id
      WHERE 1=1
    `;

    if (userId) {
      query += " AND t.user_id = @userId";
      req.input("userId", sql.Int, parseInt(userId));
    }

    if (type) {
      query += " AND t.transaction_type = @type";
      req.input("type", sql.VarChar, type);
    }

    if (startDate) {
      query += " AND t.transaction_date >= @startDate";
      req.input("startDate", sql.Date, new Date(startDate));
    }

    if (endDate) {
      query += " AND t.transaction_date <= @endDate";
      req.input("endDate", sql.Date, new Date(endDate));
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC";
    query += " OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY";
    req.input("limit", sql.Int, parseInt(limit));

    const result = await req.query<TransactionWithCategory>(query);

    const response: ApiResponse<TransactionWithCategory[]> = {
      success: true,
      data: result.recordset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body: CreateTransactionRequest = await request.json();
    const { user_id, category_id, amount, transaction_type, transaction_date, description } = body;

    // Validation
    if (!user_id || !category_id || !amount || !transaction_type || !transaction_date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(transaction_type)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, user_id)
      .input("categoryId", sql.Int, category_id)
      .input("amount", sql.Decimal(12, 2), amount)
      .input("transactionType", sql.VarChar(10), transaction_type)
      .input("transactionDate", sql.Date, new Date(transaction_date))
      .input("description", sql.NVarChar(500), description || null)
      .query<Transaction>(`
        INSERT INTO Transactions (user_id, category_id, amount, transaction_type, transaction_date, description)
        OUTPUT INSERTED.*
        VALUES (@userId, @categoryId, @amount, @transactionType, @transactionDate, @description)
      `);

    const response: ApiResponse<Transaction> = {
      success: true,
      data: result.recordset[0],
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}