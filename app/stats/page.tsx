"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, MapPin, AlertCircle, Loader2 } from "lucide-react";

// Types
interface ExpenseCategory {
  category: string;
  amount: number;
}

interface CityData {
  name: string;
  amount: number;
}

export default function CityStatsScreen() {
  const [cityExpenses, setCityExpenses] = useState<ExpenseCategory[]>([]);
  const [cityComparison, setCityComparison] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resExp, resCity] = await Promise.all([
          fetch("/api/city-stats/category-expenses"),
          fetch("/api/city-stats/city-comparison"),
        ]);

        if (!resExp.ok || !resCity.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const dataExp = await resExp.json();
        const dataCity = await resCity.json();

        console.log("Category expenses:", dataExp);
        console.log("City comparison:", dataCity);

        setCityExpenses(dataExp);
        setCityComparison(dataCity);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to database. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate max values for chart scaling
  const maxExpense = cityExpenses.length > 0 
    ? Math.max(...cityExpenses.map((e) => Number(e.amount) || 0), 1) 
    : 1;
  const maxCityAmount = cityComparison.length > 0 
    ? Math.max(...cityComparison.map((c) => Number(c.amount) || 0), 1) 
    : 1;

  // Find highest values for Quick Stats
  const highestCategory = cityExpenses.length > 0
    ? cityExpenses.reduce((prev, current) => 
        (Number(prev.amount) || 0) > (Number(current.amount) || 0) ? prev : current
      )
    : { category: "-", amount: 0 };

  const mostExpensiveCity = cityComparison.length > 0
    ? cityComparison.reduce((prev, current) => 
        (Number(prev.amount) || 0) > (Number(current.amount) || 0) ? prev : current
      )
    : { name: "-", amount: 0 };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center">
        <div className="flex flex-col items-center text-white">
          <Loader2 className="w-10 h-10 mb-3 animate-spin" />
          <p className="text-lg font-medium">Loading Statistics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl text-center max-w-sm shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-red-600 font-bold text-lg mb-2">Connection Error</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
          <BarChart3 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            City Statistics
          </h1>
          <p className="text-emerald-100 text-xs">Compare your spending</p>
        </div>
      </div>

      {/* Card 1: Your Spending by Category */}
      <div className="bg-white rounded-3xl p-5 shadow-xl mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <h3 className="text-gray-900 font-bold">Your Spending by Category</h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
            Personal
          </span>
        </div>

        {/* Bar Chart for Categories */}
        <div className="flex items-end justify-between gap-2 h-48 px-2 pt-6 border-b border-gray-200">
          {cityExpenses.length > 0 ? (
            cityExpenses.map((item, index) => {
              const amount = Number(item.amount) || 0;
              const heightPercent = maxExpense > 0 ? (amount / maxExpense) * 100 : 0;
              
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center group max-w-12"
                >
                  {/* Value on top */}
                  <span className="text-[10px] text-gray-600 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : amount}
                  </span>
                  
                  {/* Bar container */}
                  <div className="w-full h-32 flex items-end justify-center">
                    {/* The bar */}
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 group-hover:from-teal-500 group-hover:to-cyan-400 cursor-pointer"
                      style={{
                        height: amount > 0 ? `${Math.max(heightPercent, 5)}%` : "4px",
                      }}
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[9px] text-gray-500 mt-2 text-center font-medium w-full truncate">
                    {item.category.split(" ")[0]}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 h-full">
              No expense data
            </div>
          )}
        </div>
        
        {/* Y-axis max value indicator */}
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-2">
          <span>Max: NT${maxExpense.toLocaleString()}</span>
        </div>
      </div>

      {/* Card 2: Cost of Living by City */}
      <div className="bg-white rounded-3xl p-5 shadow-xl mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <h3 className="text-gray-900 font-bold">Cost of Living by City</h3>
          </div>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
            Taiwan
          </span>
        </div>

        {/* Bar Chart for Cities */}
        <div className="flex items-end justify-between gap-1 h-52 px-1 pt-6 border-b border-gray-200">
          {cityComparison.map((city, index) => {
            const amount = Number(city.amount) || 0;
            const heightPercent = maxCityAmount > 0 ? (amount / maxCityAmount) * 100 : 0;
            
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group max-w-10"
              >
                {/* Value on top */}
                <span className="text-[9px] text-gray-600 font-semibold mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {(amount/1000).toFixed(0)}k
                </span>
                
                {/* Bar container */}
                <div className="w-full h-36 flex items-end justify-center">
                  {/* The bar */}
                  <div
                    className="w-full bg-gradient-to-t from-gray-700 to-gray-500 rounded-t-md transition-all duration-500 group-hover:from-blue-600 group-hover:to-cyan-400 cursor-pointer"
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: "8px",
                    }}
                  />
                </div>

                {/* Label */}
                <span className="text-[8px] text-gray-500 mt-2 text-center font-medium leading-tight w-full truncate">
                  {city.name.replace(" City", "").replace(" County", "").substring(0, 5)}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis max value indicator */}
        <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-2">
          <span>Max: NT${maxCityAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Card 3: Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Highest Spending Category */}
        <div className="bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-100 text-xs font-medium">Top Category</p>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <TrendingUp size={14} className="text-white" />
            </div>
          </div>
          <p className="text-white font-bold text-lg truncate">
            {highestCategory.category?.split(" ")[0] || "-"}
          </p>
          <p className="text-emerald-300 text-sm font-mono mt-1">
            NT${Number(highestCategory.amount || 0).toLocaleString()}
          </p>
        </div>

        {/* Most Expensive City */}
        <div className="bg-white/15 backdrop-blur border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-emerald-100 text-xs font-medium">Top City Cost</p>
            <div className="bg-white/20 p-1.5 rounded-lg">
              <MapPin size={14} className="text-white" />
            </div>
          </div>
          <p className="text-white font-bold text-lg truncate">
            {mostExpensiveCity.name?.replace(" City", "") || "-"}
          </p>
          <p className="text-emerald-300 text-sm font-mono mt-1">
            NT${Number(mostExpensiveCity.amount || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}