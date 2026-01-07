"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, MapPin, AlertCircle } from 'lucide-react';

// --- 1. DEFINISI TIPE DATA (TYPESCRIPT) ---
interface ExpenseCategory {
  category: string;
  amount: number;
}

interface CityData {
  name: string;
  amount: number;
}

export default function ReportScreen() {
  // --- 2. STATE MANAGEMENT ---
  const [cityExpenses, setCityExpenses] = useState<ExpenseCategory[]>([]);
  const [cityComparison, setCityComparison] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 3. FETCH DATA DARI BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pastikan backend (node server.js) sudah jalan di port 5000
        const [resExp, resCity] = await Promise.all([
          fetch('http://localhost:5000/api/category-expenses'),
          fetch('http://localhost:5000/api/city-comparison')
        ]);

        if (!resExp.ok || !resCity.ok) {
          throw new Error("Fail take data from server");
        }

        const dataExp = await resExp.json();
        const dataCity = await resCity.json();

        setCityExpenses(dataExp);
        setCityComparison(dataCity);
      } catch (err) {
        console.error(err);
        setError("Fail connect to database. Make sure the server is on");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 4. KALKULASI LOGIKA ---
  
  // Cari nilai maksimum untuk skala grafik
  const maxExpense = cityExpenses.length > 0 ? Math.max(...cityExpenses.map((e) => e.amount)) : 1;
  const maxCityAmount = cityComparison.length > 0 ? Math.max(...cityComparison.map((c) => c.amount)) : 1;

  // Cari item termahal otomatis untuk "Quick Stats"
  const highestCategory = cityExpenses.reduce((prev, current) => (prev.amount > current.amount) ? prev : current, { category: '-', amount: 0 });
  const mostExpensiveCity = cityComparison.reduce((prev, current) => (prev.amount > current.amount) ? prev : current, { name: '-', amount: 0 });

  // --- 5. RENDER TAMPILAN (UI) ---

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center">
          <BarChart3 className="w-10 h-10 mb-2" />
          <p>Loading Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white/90 p-6 rounded-2xl text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h3 className="text-red-600 font-bold mb-1">Connection Error</h3>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24 font-sans">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 pt-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/10">
          <BarChart3 className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            City Statistics
          </h1>
          <p className="text-emerald-100 text-xs opacity-80">Real-time database view</p>
        </div>
      </div>

      {/* CARD 1: EXPENSE PER KATEGORI (TRANSACTION TABLE) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 border border-emerald-100/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
                <TrendingUp size={16} className="text-gray-700"/>
            </div>
            <h3 className="text-gray-900 font-bold text-lg leading-none">
              Spending by Category
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
            Personal
          </span>
        </div>
        
        {/* CHART AREA */}
        <div className="flex items-end gap-2 h-44 pb-2 border-b border-gray-100">
          {cityExpenses.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer">
              
              {/* Tooltip Hover (Angka Exact) */}
              <div className="absolute -top-10 bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap shadow-lg">
                NT$ {item.amount.toLocaleString()}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>

              {/* Batang Diagram */}
              <div className="w-full h-full flex items-end justify-center rounded-t-lg bg-gray-100 overflow-hidden relative">
                 <div
                    className="w-full bg-linear-to-t from-gray-700 to-gray-500 rounded-t-lg transition-all duration-700 ease-out group-hover:from-emerald-500 group-hover:to-teal-400"
                    style={{
                      // TRICK: Jika data ada (>0), tinggi minimal 8% supaya bar tetap terlihat walau nilainya kecil
                      height: item.amount > 0 ? `${Math.max((item.amount / maxExpense) * 100, 8)}%` : '0%',
                    }}
                  />
              </div>

              {/* Label Kategori (Rotated) */}
              <span className="text-[10px] text-gray-500 mt-3 -rotate-45 origin-center whitespace-nowrap font-medium w-full text-center truncate">
                {item.category.split(' ')[0]} {/* Ambil kata pertama saja biar rapi */}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 2: COMPARISON WITH OTHER CITIES (CITY TABLE) */}
      <div className="bg-white rounded-3xl p-6 shadow-xl mb-6 border border-emerald-100/50">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gray-100 rounded-lg">
                <MapPin size={16} className="text-gray-700"/>
            </div>
            <h3 className="text-gray-900 font-bold text-lg leading-none">
                Cost of Living
            </h3>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
            Official Data
          </span>
        </div>

        {/* CHART AREA */}
        <div className="flex items-end gap-3 h-48 pb-2">
          {cityComparison.map((city, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group relative">
              
              <div
                className="w-full bg-linear-to-t from-gray-700 to-gray-500 rounded-t-md transition-all duration-500 hover:from-blue-600 hover:to-cyan-400 relative shadow-sm"
                style={{
                  height: `${(city.amount / maxCityAmount) * 100}%`,
                  minHeight: "10px",
                }}
              >
                 {/* Label Harga di dalam bar jika cukup tinggi, atau di atas jika pendek */}
                 <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                    ${(city.amount / 1000).toFixed(1)}k
                 </div>
              </div>

              <span className="text-[10px] text-gray-600 mt-2 font-semibold text-center leading-tight">
                {city.name.replace(" City", "").replace("New ", "N.")} 
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 3: QUICK STATS (DYNAMIC CALCULATION) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Highest Spending */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
                <p className="text-emerald-100 text-xs mb-1 font-medium">Highest Spend</p>
                <p className="text-white font-bold text-lg tracking-wide truncate max-w-25">
                    {highestCategory.category}
                </p>
            </div>
            <div className="bg-white/20 p-1.5 rounded-lg">
                <AlertCircle size={14} className="text-white"/>
            </div>
          </div>
          <p className="text-emerald-300 text-sm font-mono mt-2">
            NT$ {highestCategory.amount.toLocaleString()}
          </p>
        </div>

        {/* Most Expensive City */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col justify-between">
           <div className="flex items-start justify-between">
            <div>
                <p className="text-emerald-100 text-xs mb-1 font-medium">Top Cost City</p>
                <p className="text-white font-bold text-lg tracking-wide truncate max-w-25">
                    {mostExpensiveCity.name.replace(" City", "")}
                </p>
            </div>
             <div className="bg-white/20 p-1.5 rounded-lg">
                <MapPin size={14} className="text-white"/>
            </div>
          </div>
          <p className="text-emerald-300 text-sm font-mono mt-2">
            NT$ {mostExpensiveCity.amount.toLocaleString()}
          </p>
        </div>
      </div>

    </div>
  );
}