"use client";
import Navbar from "./components/navbar";
import { useState } from "react";
import HomeScreen from "./Homescreen/page";
import ReportScreen from "./Report/page";
import StatsScreen from "./stats/page";
import MoreScreen from "./more/page";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="max-w-107.5 mx-auto min-h-screen bg-gray-100 relative overflow-hidden">
      {/* Screen Content */}
      <div className="transition-all duration-300">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "report" && <ReportScreen />}
        {activeTab === "stats" && <StatsScreen />}
        {activeTab === "more" && <MoreScreen />}
      </div>

      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
