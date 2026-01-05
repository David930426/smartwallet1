"use server"
// lib/data.ts
import { DbConnect } from "@/lib/db";
import sql from "mssql";

// 1. Ambil Ringkasan Saldo (untuk HomeScreen)
export async function getBalanceSummary(userId: string) {
    const pool = await DbConnect();
    const result = await pool.request()
        .input('userId', sql.NVarChar, userId)
        .query(`
            SELECT TOP 1 total_income, total_expense, (total_income - total_expense) as balance 
            FROM Reports 
            WHERE user_id = @userId 
            ORDER BY year DESC, month DESC
        `);
    return result.recordset[0];
}

// 2. Ambil Transaksi Terbaru (untuk HomeScreen)
export async function getRecentTransactions(userId: string) {
    const pool = await DbConnect();
    const result = await pool.request()
        .input('userId', sql.NVarChar, userId)
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
    const result = await pool.request()
        .query(`
            SELECT c.city_name as name, AVG(r.total_expense) as amount
            FROM City c
            JOIN Users u ON c.city_id = u.city_id
            JOIN Reports r ON u.user_id = r.user_id
            GROUP BY c.city_name
        `);
    return result.recordset;
}