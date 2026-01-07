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
    
    // Get current month's income and expense totals
    const summaryResult = await pool.request()
      .input("userId", sql.NVarChar, user.value)
      .query(`
        SELECT 
          COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END), 0) as total_expense
        FROM Transactions
        WHERE user_id = @userId
          AND MONTH(transaction_date) = MONTH(GETDATE())
          AND YEAR(transaction_date) = YEAR(GETDATE())
      `);

    // Get expense breakdown by category (for pie chart)
    const categoryResult = await pool.request()
      .input("userId", sql.NVarChar, user.value)
      .query(`
        SELECT 
          c.category_name as label,
          COALESCE(SUM(t.amount), 0) as amount
        FROM Categories c
        LEFT JOIN Transactions t ON c.category_id = t.category_id 
          AND t.user_id = @userId
          AND t.transaction_type = 'Expense'
          AND MONTH(t.transaction_date) = MONTH(GETDATE())
          AND YEAR(t.transaction_date) = YEAR(GETDATE())
        WHERE c.category_type = 'Expense'
        GROUP BY c.category_id, c.category_name
        HAVING COALESCE(SUM(t.amount), 0) > 0
        ORDER BY amount DESC
      `);

    // Get recent transactions for summary
    const transactionsResult = await pool.request()
      .input("userId", sql.NVarChar, user.value)
      .query(`
        SELECT TOP 10
          t.description as label,
          t.transaction_type as type,
          t.amount,
          t.transaction_date,
          c.category_name
        FROM Transactions t
        JOIN Categories c ON t.category_id = c.category_id
        WHERE t.user_id = @userId
          AND MONTH(t.transaction_date) = MONTH(GETDATE())
          AND YEAR(t.transaction_date) = YEAR(GETDATE())
        ORDER BY t.transaction_date DESC
      `);

    const summary = summaryResult.recordset[0];
    const totalExpense = Number(summary.total_expense) || 0;
    
    // Calculate percentages for pie chart
    const colors = ["#3B82F6", "#F59E0B", "#14B8A6", "#EC4899", "#8B5CF6", "#EF4444", "#06B6D4"];
    const pieData = categoryResult.recordset.map((item: any, index: number) => ({
      label: item.label,
      amount: Number(item.amount) || 0,
      percent: totalExpense > 0 ? Math.round((Number(item.amount) / totalExpense) * 100) : 0,
      color: colors[index % colors.length],
    }));

    // Format transactions for summary
    const transactions = transactionsResult.recordset.map((item: any) => ({
      label: item.label || item.category_name,
      type: item.type === 'Income' ? 'income' : 'outcome',
      amount: Number(item.amount) || 0,
    }));

    return NextResponse.json({
      total_income: Number(summary.total_income) || 0,
      total_expense: totalExpense,
      pieData,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}