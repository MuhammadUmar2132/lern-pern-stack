"use client";

import { useState } from "react";
import { Post, Comment, User } from "@/types";
import { postsService, commentsService } from "@/services";
import { PostCard } from "./PostCard";
import { PostForm } from "./PostForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { EmptyState } from "../ui/EmptyState";

interface PostsTabProps {
  posts: Post[];
  users: User[];
  loading: boolean;
  selectedUserFilter: number | "all";
  onFilterUser: (userId: number | "all") => void;
  onRefreshPosts: () => void;
  onNotify: (message: string, type?: "success" | "error") => void;
}

export function PostsTab({
  posts,
  users,
  loading,
  selectedUserFilter,
  onFilterUser,
  onRefreshPosts,
  onNotify,
}: PostsTabProps) {
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<number, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const fetchComments = async (postId: number) => {
    const res = await commentsService.getByPostId(postId);
    if (res.success && Array.isArray(res.data)) {
      setCommentsByPost((prev) => ({ ...prev, [postId]: res.data! }));
    }
  };

  const handleToggleComments = (postId: number) => {
    const isExpanded = !!expandedComments[postId];
    setExpandedComments((prev) => ({ ...prev, [postId]: !isExpanded }));
    if (!isExpanded && !commentsByPost[postId]) {
      fetchComments(postId);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const res = await postsService.delete(id);
    if (res.success) {
      onNotify("Post deleted successfully");
      onRefreshPosts();
    } else {
      onNotify(res.message || "Failed to delete post", "error");
    }
  };

  const getUserName = (id: number) => {
    const u = users.find((user) => user.id === id);
    return u ? u.name : `User #${id}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-4 space-y-6">
        <PostForm
          editingPost={editingPost}
          users={users}
          onSuccess={(msg) => {
            onNotify(msg, "success");
            setEditingPost(null);
            onRefreshPosts();
          }}
          onError={(msg) => onNotify(msg, "error")}
          onCancelEdit={() => setEditingPost(null)}
        />
      </div>

      {/* Feed Section */}
      <div className="lg:col-span-8 space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Filter by Author:</span>
            <select
              value={selectedUserFilter}
              onChange={(e) => {
                const val = e.target.value === "all" ? "all" : Number(e.target.value);
                onFilterUser(val);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Users ({posts.length})</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefreshPosts}
            className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            🔄 Refresh Feed
          </button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading feed..." />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No posts found"
            description="Publish a post from the form on the left to start community conversations and comments."
          />
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                authorName={getUserName(post.user_id)}
                users={users}
                comments={commentsByPost[post.id]}
                isCommentsExpanded={!!expandedComments[post.id]}
                onToggleComments={handleToggleComments}
                onRefreshComments={fetchComments}
                onEdit={(p) => {
                  setEditingPost(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onDelete={handleDeletePost}
                onNotify={onNotify}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
