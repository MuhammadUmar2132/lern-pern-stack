"use client";

import { useState } from "react";
import { Item } from "@/types";
import { itemsService } from "@/services";
import { ItemCard } from "./ItemCard";
import { ItemForm } from "./ItemForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { EmptyState } from "../ui/EmptyState";

interface ItemsTabProps {
  items: Item[];
  loading: boolean;
  onRefresh: () => void;
  onNotify: (message: string, type?: "success" | "error") => void;
}

export function ItemsTab({
  items,
  loading,
  onRefresh,
  onNotify,
}: ItemsTabProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const res = await itemsService.delete(id);
    if (res.success) {
      onNotify("Item deleted successfully");
      onRefresh();
    } else {
      onNotify(res.message || "Failed to delete item", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-4 space-y-6">
        <ItemForm
          editingItem={editingItem}
          onSuccess={(msg) => {
            onNotify(msg, "success");
            setEditingItem(null);
            onRefresh();
          }}
          onError={(msg) => onNotify(msg, "error")}
          onCancelEdit={() => setEditingItem(null)}
        />
      </div>

      {/* Gallery Section */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Item Gallery ({items.length})</h2>
          <button
            onClick={onRefresh}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>🔄 Refresh</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading items from PostgreSQL..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No items found"
            description="Use the form on the left to add your first product or inventory item with Cloudinary image upload."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(item) => {
                  setEditingItem(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
