import { NextRequest, NextResponse } from "next/server";
import { getConnection, sql } from "@/lib/db";
import { Report, DashboardSummary, ApiResponse } from "@/index";

// GET /api/reports - Get reports or dashboard summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const type = searchParams.get("type"); // 'dashboard', 'monthly', or 'yearly'
    const month = searchParams.get("month");
    const year = searchParams.get("year") || new Date().getFullYear().toString();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Dashboard summary - total balance, income, expense, and recent transactions
    if (type === "dashboard" || !type) {
      const summaryResult = await pool
        .request()
        .input("userId", sql.Int, parseInt(userId))
        .query(`
          SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
          FROM Transactions
          WHERE user_id = @userId
        `);

      const recentTransactions = await pool
        .request()
        .input("userId", sql.Int, parseInt(userId))
        .query(`
          SELECT TOP 10
            t.transaction_id,
            t.user_id,
            t.category_id,
            t.amount,
            t.transaction_type,
            t.transaction_date,
            t.description,
            c.category_name,
            c.icon
          FROM Transactions t
          INNER JOIN Categories c ON t.category_id = c.category_id
          WHERE t.user_id = @userId
          ORDER BY t.transaction_date DESC, t.created_at DESC
        `);

      const summary = summaryResult.recordset[0];
      const dashboardData: DashboardSummary = {
        total_balance: summary.total_income - summary.total_expense,
        total_income: summary.total_income,
        total_expense: summary.total_expense,
        recent_transactions: recentTransactions.recordset,
      };

      return NextResponse.json({ success: true, data: dashboardData });
    }

    // Monthly report
    if (type === "monthly" && month) {
      const result = await pool
        .request()
        .input("userId", sql.Int, parseInt(userId))
        .input("month", sql.Int, parseInt(month))
        .input("year", sql.Int, parseInt(year))
        .query(`
          SELECT 
            c.category_name,
            c.icon,
            c.category_type,
            COALESCE(SUM(t.amount), 0) as total_amount,
            COUNT(t.transaction_id) as transaction_count
          FROM Categories c
          LEFT JOIN Transactions t ON c.category_id = t.category_id 
            AND t.user_id = @userId
            AND MONTH(t.transaction_date) = @month
            AND YEAR(t.transaction_date) = @year
          GROUP BY c.category_id, c.category_name, c.icon, c.category_type
          ORDER BY total_amount DESC
        `);

      const totalSummary = await pool
        .request()
        .input("userId", sql.Int, parseInt(userId))
        .input("month", sql.Int, parseInt(month))
        .input("year", sql.Int, parseInt(year))
        .query(`
          SELECT 
            COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
          FROM Transactions
          WHERE user_id = @userId
            AND MONTH(transaction_date) = @month
            AND YEAR(transaction_date) = @year
        `);

      return NextResponse.json({
        success: true,
        data: {
          month: parseInt(month),
          year: parseInt(year),
          summary: totalSummary.recordset[0],
          categories: result.recordset,
        },
      });
    }

    // Yearly report
    if (type === "yearly") {
      const result = await pool
        .request()
        .input("userId", sql.Int, parseInt(userId))
        .input("year", sql.Int, parseInt(year))
        .query(`
          SELECT 
            MONTH(transaction_date) as month,
            COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
          FROM Transactions
          WHERE user_id = @userId
            AND YEAR(transaction_date) = @year
          GROUP BY MONTH(transaction_date)
          ORDER BY month
        `);

      return NextResponse.json({
        success: true,
        data: {
          year: parseInt(year),
          monthly_data: result.recordset,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid report type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Generate and save a monthly report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, month, year } = body;

    if (!user_id || !month || !year) {
      return NextResponse.json(
        { success: false, error: "user_id, month, and year are required" },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Calculate totals
    const totals = await pool
      .request()
      .input("userId", sql.Int, user_id)
      .input("month", sql.Int, month)
      .input("year", sql.Int, year)
      .query(`
        SELECT 
          COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
        FROM Transactions
        WHERE user_id = @userId
          AND MONTH(transaction_date) = @month
          AND YEAR(transaction_date) = @year
      `);

    const { total_income, total_expense } = totals.recordset[0];

    // Upsert report
    const result = await pool
      .request()
      .input("userId", sql.Int, user_id)
      .input("month", sql.Int, month)
      .input("year", sql.Int, year)
      .input("totalIncome", sql.Decimal(12, 2), total_income)
      .input("totalExpense", sql.Decimal(12, 2), total_expense)
      .query<Report>(`
        MERGE INTO Reports AS target
        USING (SELECT @userId as user_id, @month as month, @year as year) AS source
        ON target.user_id = source.user_id 
          AND target.month = source.month 
          AND target.year = source.year
        WHEN MATCHED THEN
          UPDATE SET 
            total_income = @totalIncome, 
            total_expense = @totalExpense
        WHEN NOT MATCHED THEN
          INSERT (user_id, month, year, total_income, total_expense)
          VALUES (@userId, @month, @year, @totalIncome, @totalExpense)
        OUTPUT INSERTED.*;
      `);

    return NextResponse.json(
      { success: true, data: result.recordset[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    );
  }
}