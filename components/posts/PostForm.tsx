"use client";

import { useState, useEffect } from "react";
import { Post, PostInput, User } from "@/types";
import { postsService } from "@/services";

interface PostFormProps {
  editingPost: Post | null;
  users: User[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onCancelEdit: () => void;
}

export function PostForm({
  editingPost,
  users,
  onSuccess,
  onError,
  onCancelEdit,
}: PostFormProps) {
  const [userId, setUserId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setUserId(editingPost.user_id);
      setTitle(editingPost.title);
      setContent(editingPost.content || "");
      setImageUrl(editingPost.image_url || "");
      setSelectedFile(null);
    } else {
      resetForm();
      if (users.length > 0) {
        setUserId(users[0].id);
      }
    }
  }, [editingPost, users]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageUrl("");
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!editingPost && !userId)) {
      onError("Please select an author and enter a title");
      return;
    }

    setSubmitting(true);
    let finalImageUrl = imageUrl;

    if (selectedFile) {
      setUploading(true);
      const uploadRes = await postsService.uploadImage(selectedFile);
      setUploading(false);

      if (uploadRes.success && uploadRes.data?.url) {
        finalImageUrl = uploadRes.data.url;
      } else {
        onError(uploadRes.message || "Failed to upload image to Cloudinary");
        setSubmitting(false);
        return;
      }
    }

    if (editingPost) {
      const payload: Partial<PostInput> = {
        title: title.trim(),
        content: content.trim() || undefined,
        imageUrl: finalImageUrl || null,
      };
      const res = await postsService.update(editingPost.id, payload);
      if (res.success) {
        onSuccess("Post updated successfully!");
        resetForm();
      } else {
        onError(res.message || "Failed to update post");
      }
    } else {
      const payload: PostInput = {
        userId: Number(userId),
        title: title.trim(),
        content: content.trim() || undefined,
        imageUrl: finalImageUrl || null,
      };
      const res = await postsService.create(payload);
      if (res.success) {
        onSuccess("Post published successfully!");
        resetForm();
      } else {
        onError(res.message || "Failed to publish post");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>{editingPost ? "✏️" : "💬"}</span>
          <span>{editingPost ? "Edit Post" : "Write a Post"}</span>
        </h2>
        {editingPost && (
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
        {!editingPost && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Author *
            </label>
            {users.length === 0 ? (
              <p className="text-xs text-amber-400 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg">
                ⚠️ Please create at least one user first in the Users tab.
              </p>
            ) : (
              <select
                value={userId}
                onChange={(e) => setUserId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Post Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this post about?"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Content
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 file:cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || submitting || (!editingPost && users.length === 0)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading Image...</span>
            </>
          ) : submitting ? (
            <span>Publishing...</span>
          ) : (
            <span>{editingPost ? "Save Changes" : "Publish Post"}</span>
          )}
        </button>
      </form>
    </div>
  );
}
