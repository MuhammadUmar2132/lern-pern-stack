"use client";

import { User } from "@/types";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onViewPosts: (userId: number) => void;
}

export function UserCard({ user, onEdit, onDelete, onViewPosts }: UserCardProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-white text-sm truncate">{user.name}</h3>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
          <span className="text-[10px] text-slate-500 font-mono">ID: #{user.id}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => onViewPosts(user.id)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
        >
          View Posts →
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/60 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
