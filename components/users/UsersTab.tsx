"use client";

import { useState } from "react";
import { User } from "@/types";
import { usersService } from "@/services";
import { UserCard } from "./UserCard";
import { UserForm } from "./UserForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { EmptyState } from "../ui/EmptyState";

interface UsersTabProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (message: string, type?: "success" | "error") => void;
  onViewUserPosts: (userId: number) => void;
}

export function UsersTab({
  users,
  loading,
  onRefresh,
  onNotify,
  onViewUserPosts,
}: UsersTabProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure? This will delete the user and all associated posts/comments in PostgreSQL!"
      )
    )
      return;

    const res = await usersService.delete(id);
    if (res.success) {
      onNotify("User and their data deleted successfully");
      onRefresh();
    } else {
      onNotify(res.message || "Failed to delete user", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form */}
      <div className="lg:col-span-4 space-y-6">
        <UserForm
          editingUser={editingUser}
          onSuccess={(msg) => {
            onNotify(msg, "success");
            setEditingUser(null);
            onRefresh();
          }}
          onError={(msg) => onNotify(msg, "error")}
          onCancelEdit={() => setEditingUser(null)}
        />
      </div>

      {/* List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Registered Users ({users.length})</h2>
          <button
            onClick={onRefresh}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>🔄 Refresh Users</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No users created"
            description="Create your first user to start posting and commenting across the community feed."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={(u) => {
                  setEditingUser(u);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onDelete={handleDelete}
                onViewPosts={onViewUserPosts}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
