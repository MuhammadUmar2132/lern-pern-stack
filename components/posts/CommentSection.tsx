"use client";

import { useState } from "react";
import { Comment, User } from "@/types";
import { commentsService } from "@/services";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  users: User[];
  onRefreshComments: (postId: number) => void;
  onNotify: (message: string, type?: "success" | "error") => void;
}

export function CommentSection({
  postId,
  comments,
  users,
  onRefreshComments,
  onNotify,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | "">(
    users.length > 0 ? users[0].id : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const getUserName = (id: number) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name : `User #${id}`;
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!selectedUserId) {
      onNotify("Please select an author to comment as", "error");
      return;
    }

    setSubmitting(true);
    const res = await commentsService.create(postId, {
      userId: Number(selectedUserId),
      message: commentText.trim(),
    });
    setSubmitting(false);

    if (res.success) {
      setCommentText("");
      onRefreshComments(postId);
      onNotify("Comment posted!");
    } else {
      onNotify(res.message || "Failed to post comment", "error");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const res = await commentsService.delete(commentId);
    if (res.success) {
      onRefreshComments(postId);
      onNotify("Comment removed");
    } else {
      onNotify(res.message || "Failed to delete comment", "error");
    }
  };

  return (
    <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 space-y-4">
      {/* Comments List */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No comments yet. Be the first to start the discussion!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              authorName={getUserName(comment.user_id)}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>

      {/* Add Comment Input Bar */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800/80">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 sm:w-36"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddComment();
          }}
          placeholder="Write a comment..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          onClick={handleAddComment}
          disabled={submitting || !commentText.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Posting..." : "Send"}
        </button>
      </div>
    </div>
  );
}
