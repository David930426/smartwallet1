"use client";
import { InitialState, loginAction } from "@/lib/login";
import Link from "next/link";
import { useActionState } from "react";

export default function Login() {
  const initialState:InitialState = { message: "" };
  const [state, submitAction] = useActionState(loginAction, initialState);
  return (
    <div className="max-w-107.5 mx-auto min-h-screen bg-gray-100 relative overflow-hidden">
      <div className="min-h-screen bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 flex p-5 flex-col items-center justify-center">
        <div className="bg-white text-gray-800 items-center px-15 py-10 rounded-3xl shadow-xl">
          <h1 className="text-center font-bold text-4xl mt-5 mb-10">
            My Wallet
          </h1>
          <form action={submitAction} className="flex flex-col">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              className="text-base border-2 border-emerald-500 rounded-2xl h-10 p-3 focus:outline-emerald-600 mt-2 mb-5"
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="text-base border-2 border-emerald-500 rounded-2xl h-10 p-3 focus:outline-emerald-600 mt-2 mb-3"
            />
            <p className="text-sm mb-3 text-red-500">{state.message}</p>
            <Link
              href="/register"
              className="mb-10 text-sm hover:underline hover:text-emerald-600 active:text-emeral-700"
            >
              Doesn&apos;t have account?
            </Link>
            <button
              className="w-full bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white py-2.5 rounded-full hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800 hover:cursor-pointer"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
