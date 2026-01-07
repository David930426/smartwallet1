"use client";
import { Icon } from "@/components/icon";
// import React from 'react';
// import { getBalanceSummary, getRecentTransactions } from "@/lib/data";
import { getBalanceSummary, getRecentTransactions } from "@/lib/data";
import { logout } from "@/lib/login";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ChevronDown,
  ArrowLeftSquareIcon,
} from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

// 1. Define the interface for the transaction data
export interface Transaction {
  transaction_id: number;
  transaction_type: "Income" | "Expense";
  amount: number;
  category_name: string;
  icon: string;
}

export interface Summary {
  total_income: number;
  total_expense: number;
  balance: number;
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<null | Summary>(null);
  const [transactions, setTransaction] = useState<null | Transaction[]>(null);
  useEffect(() => {
    const income = async () => {
      const getSummary = await getBalanceSummary();
      const getTransaction = await getRecentTransactions();
      setSummary(getSummary);
      setTransaction(getTransaction);
    };
    income();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
            <Wallet className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Wallet
          </h1>
        </div>
        <button
          className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center hover:bg-red-500 hover:cursor-pointer transition-colors"
          onClick={() => {
            logout();
          }}
        >
          <ArrowLeftSquareIcon className="text-white" size={20} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/10 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-emerald-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-teal-100 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-60" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm font-medium">Total Balance</p>
            <div className="w-10 h-10 bg-linear-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💰</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            NT${summary?.balance?.toLocaleString() || 0}
          </h2>

          <div className="flex gap-3">
            <div className="flex-1 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={16} className="text-emerald-200" />
                <span className="text-emerald-100 text-xs font-medium">
                  Income
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                NT${summary?.total_income?.toLocaleString()}
              </p>
            </div>

            <div className="flex-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-2xl p-4 shadow-lg shadow-rose-500/30">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={16} className="text-rose-200" />
                <span className="text-rose-100 text-xs font-medium">
                  Expense
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                NT${summary?.total_expense?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Add Button */}
          <button className="absolute right-4 top-2/5 -translate-y-1/2 w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 transition-transform">
            <Plus className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ChevronDown size={16} />
          <span className="text-sm font-medium">Sort by</span>
        </button>
        <button className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2 text-white text-sm font-medium hover:bg-white/30 transition-colors">
          Last 24h
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Transactions */}
      <div className="space-y-3">
        {transactions
          ? transactions.map((tx, index) => (
              <div
                key={tx.transaction_id}
                className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5 flex items-center gap-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                    tx.transaction_type === "Income"
                      ? "bg-linear-to-br from-emerald-100 to-teal-100"
                      : "bg-linear-to-br from-rose-100 to-pink-100"
                  }`}
                >
                  {Icon(tx.icon)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    NT${tx.amount.toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm">{tx.category_name}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    tx.transaction_type === "Income"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {tx.transaction_type === "Income" ? "Income" : "Expense"}
                </div>
              </div>
            ))
          : ""}
      </div>
    </div>
  );
}
