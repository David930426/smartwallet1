"use client";

import { useEffect, useState } from "react";
import { getCategories, addTransaction } from "@/lib/action"; // Import our backend functions
import { Plus } from "lucide-react";

export interface Category {
  category_id: string;
  category_name: string;
  category_type: string | null;
  icon: string | null;
}

export default function AddTransactionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories from backend when the component mounts
  useEffect(() => {
    async function loadData() {
      const data = await getCategories();
      // Use type assertion to satisfy the state setter
      setCategories(data as unknown as Category[]);
    }
    loadData();
  }, []);

  return (
    <>
      <button
        className="absolute right-4 top-2/5 -translate-y-1/2 w-12 h-12 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-110 transition-transform hover:cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="text-white" size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <form
            action={async (formData) => {
              const result = await addTransaction(formData);
              if (result?.success) setIsOpen(false);
            }}
            className="w-3/4"
          >
            <h2 className="text-4xl font-bold text-white text-center mb-8">
              New Record
            </h2>

            <div className="flex bg-gray-300 p-1 rounded-xl text-black mb-3">
              <label className="flex-1 text-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Income"
                  defaultChecked
                  className="hidden peer"
                />
                <div className="peer-checked:bg-white peer-checked:shadow-sm py-2 rounded-lg transition-all">
                  Income
                </div>
              </label>
              <label className="flex-1 text-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="Expense"
                  className="hidden peer"
                />
                <div className="peer-checked:bg-white peer-checked:shadow-sm py-2 rounded-lg transition-all">
                  Expense
                </div>
              </label>
            </div>

            <input
              name="amount"
              type="number"
              placeholder="NT$ 0"
              className="w-full text-3xl font-bold text-center border-b-2 border-gray-100 focus:border-[#00A36C] outline-none py-2 mb-5 placeholder:text-gray-400 "
              required
            />

            <select name="category_id" className="p-5 mx-auto rounded-xl mb-5 text-xl">
              {/* 'cat' is now automatically recognized as 'Category' */}
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id} className="text-black">
                  {cat.category_name}
                </option>
              ))}
            </select>

            <input
              name="description"
              placeholder="Add a note..."
              className="w-full text-xl text-gray-800 bg-gray-50 p-4 rounded-2xl outline-none placeholder:text-gray-600 placeholder:text-xl"
            />

            <div className="flex gap-3 pt-4 mt-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-4 text-white font-medium hover:cursor-pointer hover:bg-gray-800 rounded-2xl text-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-[#00A36C] text-white rounded-2xl font-bold shadow-lg text-xl hover:bg-emerald-800 hover:cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
