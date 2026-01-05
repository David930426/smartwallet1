"use client";

import React from 'react';
import { BarChart3 } from 'lucide-react';

// 1. Define Interfaces
interface ExpenseCategory {
  category: string;
  amount: number;
}

interface CityData {
  name: string;
  amount: number;
}

export default function StatsScreen() {
  // 2. Mock Data: Average expenses by category
  const cityExpenses: ExpenseCategory[] = [
    { category: "Food", amount: 7200 },
    { category: "Rent", amount: 12000 },
    { category: "Travel", amount: 3000 },
    { category: "Shop", amount: 4500 },
    { category: "Bills", amount: 2500 },
    { category: "Entmt", amount: 1800 },
    { category: "Misc", amount: 1000 },
  ];

  // 3. Mock Data: Comparison vs other cities
  const cityComparison: CityData[] = [
    { name: "Taipei", amount: 18500 },
    { name: "Taichung", amount: 12000 },
    { name: "Kaohsiung", amount: 11500 },
    { name: "Tainan", amount: 9800 },
    { name: "Hsinchu", amount: 14000 },
  ];

  // 4. Calculations (from your snippet)
  const maxExpense = Math.max(...cityExpenses.map((e) => e.amount));
  const maxCityAmount = Math.max(...cityComparison.map((c) => c.amount));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
          <BarChart3 className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          City Statistics
        </h1>
      </div>

      {/* Your City's Average Expense */}
      <div className="bg-white rounded-3xl p-5 shadow-2xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-lg">
            Your city&apos;s average expense
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-900" />
            <span className="text-gray-500 text-xs">Your City</span>
          </div>
        </div>
        
        {/* Expense Bar Chart */}
        <div className="flex items-end gap-2 h-40">
          {cityExpenses.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-gray-800 to-gray-600 rounded-t-lg transition-all duration-500 hover:from-emerald-600 hover:to-emerald-400"
                style={{
                  height: `${(item.amount / maxExpense) * 100}%`,
                  minHeight: "8px",
                }}
              />
              <span className="text-[10px] text-gray-500 mt-2 rotate-45 origin-left whitespace-nowrap font-medium">
                {item.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison with other cities */}
      <div className="bg-white rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-900 font-bold text-lg">
            Comparison with other cities
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-900" />
            <span className="text-gray-500 text-xs">Series 1</span>
          </div>
        </div>

        {/* City Comparison Bar Chart */}
        <div className="flex items-end gap-3 h-48">
          {cityComparison.map((city, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-gray-800 to-gray-600 rounded-t-lg transition-all duration-500 hover:from-teal-600 hover:to-teal-400 relative group"
                style={{
                  height: `${(city.amount / maxCityAmount) * 100}%`,
                  minHeight: "16px",
                }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  NT${city.amount.toLocaleString()}
                </div>
              </div>
              <span className="text-xs text-gray-600 mt-2 font-medium">
                {city.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
          <p className="text-white/70 text-xs mb-1">Highest Spending</p>
          <p className="text-white font-bold text-lg">Food</p>
          <p className="text-emerald-200 text-sm">NT$7,200</p>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-2xl p-4">
          <p className="text-white/70 text-xs mb-1">Most Expensive City</p>
          <p className="text-white font-bold text-lg">台北</p>
          <p className="text-emerald-200 text-sm">NT$18,500</p>
        </div>
      </div>
    </div>
  );
}