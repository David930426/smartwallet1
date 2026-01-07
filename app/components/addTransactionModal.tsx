"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ChevronDown, Loader2, Calendar } from "lucide-react";
import { Icon } from "@/components/icon";
import { getCategories, createTransaction } from "@/lib/data";

// Types
export interface Category {
  category_id: string;
  category_name: string;
  category_type: "Income" | "Expense";
  icon: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Number Pad Component
function NumberPad({
  onNumberPress,
  onDelete,
}: {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
}) {
  const keys = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
    [".", "0", "<"],
  ];

  return (
    <div className="bg-white rounded-3xl p-4 shadow-inner">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-between mb-2 last:mb-0">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => (key === "<" ? onDelete() : onNumberPress(key))}
              className="w-20 h-16 text-2xl font-semibold text-gray-700 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [transactionType, setTransactionType] = useState<"Income" | "Expense">("Income");
  const [amount, setAmount] = useState("0");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.category_type === transactionType
  );

  // Fetch categories on mount
  useEffect(() => {
    console.log("Modal mounted, isOpen:", isOpen); // Debug log
  
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        console.log("Categories fetched:", data); // Debug log
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Reset selected category when type changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [transactionType]);

  // Set default category when filtered categories available
  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(filteredCategories[0]);
    }
  }, [filteredCategories, selectedCategory]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount("0");
      setDescription("");
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
      const result = await createTransaction({
        category_id: selectedCategory.category_id,
        amount: parseFloat(amount),
        transaction_type: transactionType,
        transaction_date: selectedDate,
        description: description || selectedCategory.category_name,
      });

      if (result) {
        setAmount("0");
        setDescription("");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display (YYYY/MM/DD)
  const formatDateDisplay = (dateStr: string) => {
    return dateStr.replace(/-/g, "/");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-end justify-center">
      <div
        className="bg-emerald-400 w-full max-w-md rounded-t-3xl p-6 pb-8 animate-slideUp max-h-[85vh] overflow-y-auto scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
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
              onClick={() => setTransactionType("Income")}
              className={`text-lg font-semibold transition-colors ${
                transactionType === "Income" ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setTransactionType("Expense")}
              className={`text-lg font-semibold transition-colors ${
                transactionType === "Expense" ? "text-gray-900" : "text-gray-600"
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
              {transactionType === "Income" ? "+" : "-"}
            </span>
            <span className="text-5xl font-bold text-gray-900">
              {parseFloat(amount).toLocaleString()}
            </span>
            <span className="text-xl text-gray-600">NTD</span>
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-4 relative">
          <p className="text-gray-600 text-sm mb-2 text-right">Category</p>
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 ml-auto px-4 py-2 border border-gray-400 rounded-lg hover:bg-white/20 transition-colors"
          >
            <span className="text-xl">
              {selectedCategory ? Icon(selectedCategory.icon) : "📁"}
            </span>
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
                  <span className="text-xl">{Icon(cat.icon)}</span>
                  <span className="font-medium text-gray-800">
                    {cat.category_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-white/30 border border-gray-400 rounded-lg text-gray-800 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {/* Number Pad */}
        <NumberPad onNumberPress={handleNumberPress} onDelete={handleDelete} />

        {/* Safe area spacer */}
        <div className="h-4" />
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}