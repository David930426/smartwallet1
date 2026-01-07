"use server";

import { DbConnect } from "@/lib/db";
import sql from "mssql";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Category } from "@/components/add-form";

/**
 * Fetches categories to populate the dropdown
 */
export async function getCategories(): Promise<Category[]> {
  const pool = await DbConnect();
  // We type the request so result.recordset is Category[]
  const result = await pool.request().query<Category>("SELECT * FROM Categories");
  return result.recordset; 
}

/**
 * Adds a new transaction and links it to the logged-in user
 */
export async function addTransaction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) throw new Error("Unauthorized");

  const amount = parseInt(formData.get("amount") as string);
  const category_id = formData.get("category_id") as string;
  const transaction_type = formData.get("type") as string;
  const description = formData.get("description") as string;
  const date = formData.get("date") as string || new Date().toISOString().split('T')[0];

  try {
    const pool = await DbConnect();
    const transaction_id = `T${Date.now().toString().slice(-6)}`;

    // Insert into SQL Server
    await pool.request()
      .input("id", sql.NVarChar, transaction_id)
      .input("uid", sql.NVarChar, userId)
      .input("cid", sql.NVarChar, category_id)
      .input("amt", sql.Int, amount)
      .input("type", sql.NVarChar, transaction_type)
      .input("date", sql.Date, date)
      .input("desc", sql.NVarChar, description)
      .query(`
        INSERT INTO Transactions (transaction_id, user_id, category_id, amount, transaction_type, transaction_date, description)
        VALUES (@id, @uid, @cid, @amt, @type, @date, @desc)
      `);

    revalidatePath("/"); 
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Failed to save transaction" };
  }
}