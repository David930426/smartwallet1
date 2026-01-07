"use client";

import React, { useState, useEffect } from 'react';
import { X, Check, ChevronDown, Loader2, Calendar } from 'lucide-react';
import NumberPad from './numberPad';
import { Category, CURRENT_USER_ID } from '@/index';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
}: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.category_type === transactionType
  );

  // Reset selected category when type changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [transactionType]);

  // Set default category when filtered categories load
  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredCategories[0]);
    }
  }, [filteredCategories, selectedCategory]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("0");
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount === "0" && num !== ".") {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount("0");
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: CURRENT_USER_ID,
          category_id: selectedCategory.category_id,
          amount: parseFloat(amount),
          transaction_type: transactionType,
          transaction_date: selectedDate,
        }),
      });

      if (response.ok) {
        setAmount("0");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const formatDateDisplay = (dateStr: string) => {
    return dateStr.replace(/-/g, '/');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
      <div
        className="bg-emerald-400 w-full max-w-md rounded-t-3xl p-6 animate-slideUp max-h-[85vh] overflow-y-auto scrollbar-hide"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          {/* Type Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTransactionType("income")}
              className={`text-lg font-semibold transition-colors ${
                transactionType === "income" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTransactionType("expense")}
              className={`text-lg font-semibold transition-colors ${
                transactionType === "expense" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Expense
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || parseFloat(amount) <= 0}
            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Check size={24} />
            )}
          </button>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 text-gray-700 mb-6">
          <span className="text-lg font-medium">{formatDateDisplay(selectedDate)}</span>
          <div className="relative">
            <Calendar size={20} className="text-gray-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-8"
            />
          </div>
          <ChevronDown size={16} />
        </div>

        {/* Amount Display */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-1">Amount</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-700">
              {transactionType === "income" ? "+" : "-"}
            </span>
            <span className="text-5xl font-bold text-gray-900">
              {parseFloat(amount).toLocaleString()}
            </span>
            <span className="text-xl text-gray-600">NTD</span>
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-6 relative">
          <p className="text-gray-600 text-sm mb-2 text-right">Category</p>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 ml-auto px-4 py-2 border border-gray-400 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span className="text-xl">{selectedCategory?.icon || "📁"}</span>
            <span className="font-medium text-gray-800">
              {selectedCategory?.category_name || "Select"}
            </span>
            <ChevronDown size={16} className="text-gray-600" />
          </button>

          {/* Category Dropdown */}
          {showCategoryDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto min-w-[200px]">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${
                    selectedCategory?.category_id === cat.category_id
                      ? "bg-emerald-50"
                      : ""
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium text-gray-800">
                    {cat.category_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number Pad */}
        <NumberPad onNumberPress={handleNumberPress} onDelete={handleDelete} />
        <div className="h-4" />
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}