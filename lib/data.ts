"use server";
// lib/data.ts
import { DbConnect } from "@/lib/db";
import sql from "mssql";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Category, CreateTransactionInput } from "..";

// 1. Ambil Ringkasan Saldo (untuk HomeScreen)
export async function getBalanceSummary() {
  const cookieStore = await cookies();
  const user = cookieStore.get("userId");

  if (!user?.value) {
    redirect("/login");
  }

  const pool = await DbConnect();
  const result = await pool.request()
    .input("userId", sql.NVarChar, user.value)
    .query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END), 0) as balance
      FROM Transactions
      WHERE user_id = @userId
    `);
  
  return result.recordset[0];
}

// 2. Ambil Transaksi Terbaru (untuk HomeScreen)
export async function getRecentTransactions() {
  const cookieStore = await cookies();
  const user = cookieStore.get("userId");

  if (!user?.value) {
    redirect("/login");
  }

  const pool = await DbConnect();
  const result = await pool.request().input("userId", sql.NVarChar, user.value)
    .query(`
            SELECT TOP 5 t.*, c.category_name, c.icon 
            FROM Transactions t
            JOIN Categories c ON t.category_id = c.category_id
            WHERE t.user_id = @userId
            ORDER BY t.transaction_date DESC
        `);
  return result.recordset;
}

// 3. Ambil Statistik Kota (untuk StatsScreen)
export async function getCityComparison() {
  const pool = await DbConnect();
  const result = await pool.request().query(`
            SELECT c.city_name as name, AVG(r.total_expense) as amount
            FROM City c
            JOIN Users u ON c.city_id = u.city_id
            JOIN Reports r ON u.user_id = r.user_id
            GROUP BY c.city_name
        `);
  return result.recordset;
}

export async function getCategories(): Promise<Category[] | null> {
  try {
    // Option 1: If using API route
    // const response = await fetch("/api/categories");
    // const result = await response.json();
    // return result.data;

    // Option 2: If using direct database query (server action)
    const pool = await DbConnect();
    const result = await pool.request().query(`
      SELECT category_id, category_name, category_type, icon
      FROM Categories
      ORDER BY category_type, category_name
    `);
    return result.recordset;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return null;
  }
}

export async function createTransaction(
  data: CreateTransactionInput
): Promise<boolean> {
  try {
    // Option 1: If using API route
    // const response = await fetch("/api/transactions", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(data),
    // });
    // return response.ok;

    // Option 2: If using direct database query (server action)
    // You need to get user_id from session/auth
    const user_id = "U001"; // Replace with actual user from session
    
    // Generate new transaction_id
    const pool = await DbConnect();
    const countResult = await pool.request().query(`
      SELECT COUNT(*) + 1 as next_id FROM Transactions
    `);
    const nextId = countResult.recordset[0].next_id;
    const transaction_id = `T${String(nextId).padStart(3, "0")}`;

    await pool
      .request()
      .input("transaction_id", transaction_id)
      .input("user_id", user_id)
      .input("category_id", data.category_id)
      .input("amount", data.amount)
      .input("transaction_type", data.transaction_type)
      .input("transaction_date", data.transaction_date)
      .input("description", data.description || null)
      .query(`
        INSERT INTO Transactions 
          (transaction_id, user_id, category_id, amount, transaction_type, transaction_date, description)
        VALUES 
          (@transaction_id, @user_id, @category_id, @amount, @transaction_type, @transaction_date, @description)
      `);

    return true;
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return false;
  }
}