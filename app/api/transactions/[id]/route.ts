import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import { Transaction, ApiResponse } from "@/index";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/transactions/[id] - Get a single transaction
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("transactionId", sql.Int, transactionId)
      .query(`
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
        WHERE t.transaction_id = @transactionId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/[id] - Update a transaction
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const transactionId = parseInt(id);
    const body = await request.json();

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const { category_id, amount, transaction_type, transaction_date, description } = body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("transactionId", sql.Int, transactionId)
      .input("categoryId", sql.Int, category_id)
      .input("amount", sql.Decimal(12, 2), amount)
      .input("transactionType", sql.VarChar(10), transaction_type)
      .input("transactionDate", sql.Date, new Date(transaction_date))
      .input("description", sql.NVarChar(500), description || null)
      .query<Transaction>(`
        UPDATE Transactions
        SET 
          category_id = @categoryId,
          amount = @amount,
          transaction_type = @transactionType,
          transaction_date = @transactionDate,
          description = @description
        OUTPUT INSERTED.*
        WHERE transaction_id = @transactionId
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/[id] - Delete a transaction
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("transactionId", sql.Int, transactionId)
      .query(`DELETE FROM Transactions WHERE transaction_id = @transactionId`);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}