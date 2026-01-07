"use client";

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

// 1. Define Interfaces
interface PieDataItem {
  label: string;
  percent: number;
  color: string;
}

interface SummaryItem {
  label: string;
  type: 'income' | 'outcome';
  amount: number;
}

export default function ReportScreen() {
  // Static data from your snippet
  const spentThisMonth = 30000;
  const incomeThisMonth = 25000;

  const pieData: PieDataItem[] = [
    { label: "Technology", percent: 24, color: "#3B82F6" },
    { label: "Food", percent: 36, color: "#94A3B8" },
    { label: "Transport", percent: 16, color: "#14B8A6" },
    { label: "Shopping", percent: 24, color: "#F59E0B" },
  ];

  // 2. Mock Data for the Summary section (was missing in snippet)
  const summaryData: SummaryItem[] = [
    { label: "Freelance Project", type: "income", amount: 15000 },
    { label: "Grocery Run", type: "outcome", amount: 2400 },
    { label: "Monthly Salary", type: "income", amount: 10000 },
    { label: "New Keyboard", type: "outcome", amount: 4500 },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6 pt-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Financial Report
        </h1>
      </div>

      {/* Pie Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {pieData.reduce(
              (acc, item, index) => {
                const startAngle = acc.offset;
                const angle = (item.percent / 100) * 360;
                const endAngle = startAngle + angle;
                const largeArc = angle > 180 ? 1 : 0;
                
                // Convert polar to cartesian coordinates
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
              <p className="font-bold text-gray-900">100%</p>
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
              {item.label} {item.percent}%
            </span>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-linear-to-br from-rose-500 to-pink-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-rose-200" />
            <span className="text-rose-100 text-sm font-medium">Spendings</span>
          </div>
          <p className="text-white text-2xl font-bold">
            ${spentThisMonth.toLocaleString()}
          </p>
          <p className="text-rose-200 text-xs mt-1">Spent this month</p>
        </div>
        
        <div className="flex-1 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-200" />
            <span className="text-emerald-100 text-sm font-medium">Income</span>
          </div>
          <p className="text-white text-2xl font-bold">
            ${incomeThisMonth.toLocaleString()}
          </p>
          <p className="text-emerald-200 text-xs mt-1">Got this month</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-900 rounded-3xl p-5 shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-4">Summary</h3>
        <div className="space-y-3">
          {summaryData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-sm">
                  {item.label}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    item.type === "income"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {item.type === "income" ? "Income" : "Outcome"}
                </span>
              </div>
              <span className="text-white font-bold">
                NT${item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}