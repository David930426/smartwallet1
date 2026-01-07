"use client";

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  MoreHorizontal, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import AddTransactionModal from '../components/addTransactionModal';
import { Transaction, Category, CURRENT_USER_ID } from '@/index';

export default function HomeScreen() {
  // ========== STATE ==========
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ========== FETCH FUNCTIONS ==========
  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/reports?user_id=${CURRENT_USER_ID}&type=dashboard`);
      const result = await response.json();
      if (result.success) {
        setTotalBalance(result.data.total_balance);
        setTotalIncome(result.data.total_income);
        setTotalExpense(result.data.total_expense);
        setTransactions(result.data.recent_transactions.map((tx: any) => ({
          transaction_id: tx.transaction_id,
          type: tx.transaction_type,
          amount: tx.amount,
          category: tx.category_name,
          icon: tx.icon,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // ========== EFFECTS ==========
  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  // ========== HANDLERS ==========
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    fetchDashboardData(); // Refresh data after adding
  };

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
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
        <button className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
          <MoreHorizontal className="text-white" size={20} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-black/10 mb-6 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-100 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 opacity-60" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm font-medium">Total Balance</p>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💰</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">
            NT${totalBalance.toLocaleString()}
          </h2>
          
          {/* Income / Expense Cards */}
          <div className="flex gap-3">
            <div className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-4 shadow-lg shadow-emerald-500/30">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft size={16} className="text-emerald-200" />
                <span className="text-emerald-100 text-xs font-medium">
                  Income
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                NT${totalIncome.toLocaleString()}
              </p>
            </div>
            
            <div className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-4 shadow-lg shadow-rose-500/30">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={16} className="text-rose-200" />
                <span className="text-rose-100 text-xs font-medium">
                  Expense
                </span>
              </div>
              <p className="text-white font-bold text-lg">
                NT${totalExpense.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Add Button */}
          <button 
            onClick={handleAddClick}
            className="absolute right-4 top-2/5 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 transition-transform"
          >
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

      {/* Transactions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="text-white animate-spin" size={32} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Tap the + button to add your first transaction
            </p>
          </div>
        ) : (
          transactions.map((tx, index) => (
            <div
              key={tx.transaction_id}
              className="bg-white rounded-2xl p-4 shadow-lg shadow-black/5 flex items-center gap-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                  tx.type === "income"
                    ? "bg-gradient-to-br from-emerald-100 to-teal-100"
                    : "bg-gradient-to-br from-rose-100 to-pink-100"
                }`}
              >
                {tx.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">
                  NT${tx.amount.toLocaleString()}
                </p>
                <p className="text-gray-500 text-sm">{tx.category}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  tx.type === "income"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {tx.type === "income" ? "Income" : "Expense"}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTransactionSuccess}
        categories={categories}
      />
    </div>
  );
}