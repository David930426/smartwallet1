"use client";

import { Home, FileText, BarChart3, MoreHorizontal } from "lucide-react";

interface NavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function NavBar({ activeTab, setActiveTab }: NavBarProps) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "report", label: "Report", icon: FileText },
    { id: "stats", label: "CityStats", icon: BarChart3 },
    { id: "more", label: "More", icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-2 py-2 z-50 max-w-107.5 mx-auto">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-emerald-500 text-white scale-105 shadow-lg shadow-emerald-500/30"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}