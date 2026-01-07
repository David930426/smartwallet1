"use server";
import { DbConnect } from "@/lib/db";
import sql from "mssql";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // 1. Import cookies

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
    return { message: "Missing credentials" };
  }

  let authenticatedUserId: string | null = null;

  try {
    const pool = await DbConnect();
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(`SELECT * FROM Users WHERE username = @username`);

    const user = result.recordset[0];

    // Simple plain-text check (Reminder: use hashing for production!)
    if (user && user.password === password) {
      authenticatedUserId = user.user_id;
    } else {
      return { message: "Wrong username or password" };
    }
  } catch (error) {
    return { message: (error as Error).message };
  }

  // 2. Set the cookie and redirect outside the try/catch block
  if (authenticatedUserId) {
    const cookieStore = await cookies();

    cookieStore.set("userId", authenticatedUserId, {
      httpOnly: true, // Prevents client-side JS from reading the cookie (Security!)
      secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
      path: "/", // Available everywhere in your app
      maxAge: 60 * 60 * 24 * 7, // Expires in 1 week
    });

    redirect("/");
  }
  return {
    message: "success",
  };
}

export async function logout() {
  const cookieStore = await cookies();

  // 1. Delete the specific cookie
  cookieStore.delete("userId");

  // 2. Redirect the user to the login page
  // We do this outside of a try/catch as well!
  redirect("/login");
}
