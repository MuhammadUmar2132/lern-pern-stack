"use client";

import { TabType } from "@/types";

interface TabsNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  itemsCount: number;
  postsCount: number;
  usersCount: number;
}

export function TabsNav({
  activeTab,
  onChangeTab,
  itemsCount,
  postsCount,
  usersCount,
}: TabsNavProps) {
  const tabs = [
    { id: "items" as TabType, label: "Items", icon: "📦", count: itemsCount },
    { id: "posts" as TabType, label: "Posts & Feed", icon: "📝", count: postsCount },
    { id: "users" as TabType, label: "Users", icon: "👥", count: usersCount },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 w-full sm:w-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Linked Entities:</span>
        <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md text-indigo-400 font-mono">
          PostgreSQL Tables: 4
        </span>
      </div>
    </div>
  );
}
