"use server";
import { DbConnect } from "@/lib/db";
import sql from "mssql";
import { redirect } from "next/navigation";

export interface InitialState {
  message: string;
}

export async function loginAction(
  prevState: InitialState | undefined,
  formData: FormData
) {
  const rawData = Object.fromEntries(formData.entries());
  const { username, password } = rawData;

  if (!username || !password) {
    return {
      message: "Missing credentials",
    };
  }
  try {
    const pool = await DbConnect();
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(`SELECT * FROM Users WHERE username = @username`);

    if (result.recordset[0].password === password) {
      redirect("/");
    } else {
      return {
        message: "Wrong username or password",
      };
    }
  } catch (error) {
    const err = error as Error;
    return {
      message: err.message,
    };
  }
}
