"use client";

import { useState, useEffect } from "react";
import { Item, ItemInput } from "@/types";
import { itemsService } from "@/services";

interface ItemFormProps {
  editingItem: Item | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onCancelEdit: () => void;
}

export function ItemForm({
  editingItem,
  onSuccess,
  onError,
  onCancelEdit,
}: ItemFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description || "");
      setImageUrl(editingItem.image_url || "");
      setSelectedFile(null);
    } else {
      resetForm();
    }
  }, [editingItem]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    let finalImageUrl = imageUrl;

    if (selectedFile) {
      setUploading(true);
      const uploadRes = await itemsService.uploadImage(selectedFile);
      setUploading(false);

      if (uploadRes.success && uploadRes.data?.url) {
        finalImageUrl = uploadRes.data.url;
      } else {
        onError(uploadRes.message || "Failed to upload image to Cloudinary");
        setSubmitting(false);
        return;
      }
    }

    const payload: ItemInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl: finalImageUrl || null,
    };

    if (editingItem) {
      const res = await itemsService.update(editingItem.id, payload);
      if (res.success) {
        onSuccess("Item updated successfully!");
        resetForm();
      } else {
        onError(res.message || "Failed to update item");
      }
    } else {
      const res = await itemsService.create(payload);
      if (res.success) {
        onSuccess("Item created successfully!");
        resetForm();
      } else {
        onError(res.message || "Failed to create item");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{editingItem ? "✏️" : "✨"}</span>
          <span>{editingItem ? "Edit Item" : "Create New Item"}</span>
        </h2>
        {editingItem && (
          <button
            onClick={() => {
              resetForm();
              onCancelEdit();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Modern Wireless Headphones"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this item..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Image (Upload to Cloudinary or URL)
          </label>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer"
            />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste direct image URL..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          {(selectedFile || imageUrl) && (
            <div className="mt-2 text-xs text-indigo-400 flex items-center gap-2">
              <span>📸 {selectedFile ? `Selected: ${selectedFile.name}` : "Image URL attached"}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading to Cloudinary...</span>
            </>
          ) : submitting ? (
            <span>Saving...</span>
          ) : (
            <span>{editingItem ? "Save Changes" : "Create Item"}</span>
          )}
        </button>
      </form>
    </div>
  );
}
