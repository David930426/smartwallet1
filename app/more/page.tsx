"use client";

import React, { useEffect, useState } from "react";
import {
  MoreHorizontal,
  Settings,
  Bell,
  Shield,
  BarChart3,
  MessageCircle,
  Info,
  ChevronRight,
  User,
  LogOut,
  Loader2,
  MapPin,
} from "lucide-react";
import { logout } from "@/lib/login";

// Types
interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  city_name: string;
}

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onClick?: () => void;
  danger?: boolean;
}

export default function MoreScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Settings size={20} className="text-gray-600" />,
      label: "Settings",
      subtitle: "App preferences",
    },
    {
      icon: <Bell size={20} className="text-amber-500" />,
      label: "Notifications",
      subtitle: "Manage alerts",
    },
    {
      icon: <Shield size={20} className="text-amber-600" />,
      label: "Security",
      subtitle: "Privacy settings",
    },
    {
      icon: <BarChart3 size={20} className="text-blue-500" />,
      label: "Export Data",
      subtitle: "Download reports",
    },
    {
      icon: <MessageCircle size={20} className="text-gray-500" />,
      label: "Support",
      subtitle: "Get help",
    },
    {
      icon: <Info size={20} className="text-blue-600" />,
      label: "About",
      subtitle: "App information",
    },
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

      {/* User Profile Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xl mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User size={32} className="text-white" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.username || "User"}
              </h2>
              <p className="text-gray-500 text-sm">{user?.email || "No email"}</p>
              {user?.city_name && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-emerald-500" />
                  <span className="text-emerald-600 text-xs font-medium">
                    {user.city_name}
                  </span>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
          >
            {/* Icon */}
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              {item.icon}
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-gray-500 text-sm">{item.subtitle}</p>
            </div>

            {/* Arrow */}
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-4 bg-white rounded-3xl p-4 shadow-xl flex items-center gap-4 hover:bg-red-50 transition-colors group"
      >
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
          <LogOut size={20} className="text-red-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-red-600">Logout</p>
          <p className="text-red-400 text-sm">Sign out of your account</p>
        </div>
        <ChevronRight size={20} className="text-red-400" />
      </button>

      {/* App Version */}
      <div className="mt-6 text-center">
        <p className="text-white/60 text-xs">Smart Wallet v1.0.0</p>
        <p className="text-white/40 text-xs mt-1">© 2026 All rights reserved</p>
      </div>
    </div>
  );
}