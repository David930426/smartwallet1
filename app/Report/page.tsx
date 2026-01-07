"use client";

import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, FileText, Loader2 } from "lucide-react";
import { JSX } from "react/jsx-runtime";

// Types
interface PieDataItem {
  label: string;
  amount: number;
  percent: number;
  color: string;
}

interface SummaryItem {
  label: string;
  type: "income" | "outcome";
  amount: number;
}

interface ReportData {
  total_income: number;
  total_expense: number;
  pieData: PieDataItem[];
  transactions: SummaryItem[];
}

export default function ReportScreen() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/reports");
        
        if (!response.ok) {
          throw new Error("Failed to fetch report data");
        }
        
        const result = await response.json();
        console.log("Report data:", result);
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="w-10 h-10 mb-3 animate-spin" />
          <p className="text-lg font-medium">Loading Report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl text-center max-w-sm shadow-xl">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-600 font-bold text-lg mb-2">No Data</h3>
          <p className="text-gray-500 text-sm mb-4">{error || "No report data available"}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { total_income, total_expense, pieData, transactions } = data;

  // Calculate total for pie chart center
  const totalPercent = pieData.reduce((sum, item) => sum + item.percent, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
          <FileText className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Financial Report
          </h1>
          <p className="text-emerald-100 text-xs">This month's overview</p>
        </div>
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 ? (
        <>
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {pieData.reduce(
                  (acc, item, index) => {
                    const startAngle = acc.offset;
                    const angle = (item.percent / 100) * 360;
                    const endAngle = startAngle + angle;
                    const largeArc = angle > 180 ? 1 : 0;

                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                    acc.paths.push(
                      <path
                        key={index}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={item.color}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    );
                    acc.offset = endAngle;
                    return acc;
                  },
                  { paths: [] as JSX.Element[], offset: 0 }
                ).paths}
                {/* Inner White Circle (Donut hole) */}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-gray-900">
                    {totalPercent > 0 ? `${totalPercent}%` : "0%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {pieData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white/90 text-xs font-medium">
                  {item.label.split(" ")[0]} {item.percent}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6 text-center">
          <p className="text-white/70">No expense data this month</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-rose-200" />
            <span className="text-rose-100 text-sm font-medium">Spendings</span>
          </div>
          <p className="text-white text-2xl font-bold">
            NT${total_expense.toLocaleString()}
          </p>
          <p className="text-rose-200 text-xs mt-1">Spent this month</p>
        </div>

        <div className="flex-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-200" />
            <span className="text-emerald-100 text-sm font-medium">Income</span>
          </div>
          <p className="text-white text-2xl font-bold">
            NT${total_income.toLocaleString()}
          </p>
          <p className="text-emerald-200 text-xs mt-1">Got this month</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className={`rounded-2xl p-4 shadow-lg mb-6 ${
        total_income - total_expense >= 0 
          ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
          : "bg-gradient-to-br from-orange-500 to-red-600"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Net Balance</p>
            <p className="text-white text-3xl font-bold">
              NT${(total_income - total_expense).toLocaleString()}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            total_income - total_expense >= 0 
              ? "bg-green-400/20 text-green-100" 
              : "bg-red-400/20 text-red-100"
          }`}>
            {total_income - total_expense >= 0 ? "Surplus" : "Deficit"}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-900 rounded-3xl p-5 shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4">Recent Transactions</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-white font-medium text-sm truncate">
                    {item.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      item.type === "income"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {item.type === "income" ? "Income" : "Expense"}
                  </span>
                </div>
                <span className={`font-bold shrink-0 ml-2 ${
                  item.type === "income" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {item.type === "income" ? "+" : "-"}NT${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No transactions this month</p>
        )}
      </div>
    </div>
  );
}