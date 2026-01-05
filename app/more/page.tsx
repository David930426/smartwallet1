"use client";

import React from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

// 1. Define Interface
interface MenuItem {
  icon: string;
  label: string;
  desc: string;
}

export default function MoreScreen() {
  // 2. Data Definition
  const menuItems: MenuItem[] = [
    { icon: "⚙️", label: "Settings", desc: "App preferences" },
    { icon: "🔔", label: "Notifications", desc: "Manage alerts" },
    { icon: "🔒", label: "Security", desc: "Privacy settings" },
    { icon: "📊", label: "Export Data", desc: "Download reports" },
    { icon: "💬", label: "Support", desc: "Get help" },
    { icon: "ℹ️", label: "About", desc: "App information" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
          <MoreHorizontal className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">More</h1>
      </div>

      {/* User Profile */}
      <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">User</h3>
            <p className="text-gray-500 text-sm">user@email.com</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
              {item.icon}
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
            {/* Rotated ChevronDown acts as a right arrow */}
            <ChevronDown className="text-gray-400 -rotate-90" size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}