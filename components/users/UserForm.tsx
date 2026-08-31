"use client";

import { useState, useEffect } from "react";
import { User, UserInput } from "@/types";
import { usersService } from "@/services";

interface UserFormProps {
  editingUser: User | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onCancelEdit: () => void;
}

export function UserForm({
  editingUser,
  onSuccess,
  onError,
  onCancelEdit,
}: UserFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name);
      setEmail(editingUser.email);
      setPassword("");
    } else {
      resetForm();
    }
  }, [editingUser]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);

    if (editingUser) {
      const payload: Partial<UserInput> = {
        name: name.trim(),
        email: email.trim(),
      };
      const res = await usersService.update(editingUser.id, payload);
      if (res.success) {
        onSuccess("User updated successfully!");
        resetForm();
      } else {
        onError(res.message || "Failed to update user");
      }
    } else {
      if (!password) {
        onError("Password is required for new users");
        setSubmitting(false);
        return;
      }
      const payload: UserInput = {
        name: name.trim(),
        email: email.trim(),
        password,
      };
      const res = await usersService.create(payload);
      if (res.success) {
        onSuccess("User created successfully!");
        resetForm();
      } else {
        onError(res.message || "Failed to create user");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{editingUser ? "✏️" : "👤"}</span>
          <span>{editingUser ? "Edit User" : "Add New User"}</span>
        </h2>
        {editingUser && (
          <button
            onClick={() => {
              resetForm();
              onCancelEdit();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        {!editingUser && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Saving..." : editingUser ? "Update User" : "Create User"}
        </button>
      </form>
    </div>
  );
}
