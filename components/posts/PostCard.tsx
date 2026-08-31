"use client";

import { Post, Comment, User } from "@/types";
import { CommentSection } from "./CommentSection";
import { FormattedDate } from "../ui/FormattedDate";

interface PostCardProps {
  post: Post;
  authorName: string;
  users: User[];
  comments: Comment[];
  isCommentsExpanded: boolean;
  onToggleComments: (postId: number) => void;
  onRefreshComments: (postId: number) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
  onNotify: (message: string, type?: "success" | "error") => void;
}

export function PostCard({
  post,
  authorName,
  users,
  comments,
  isCommentsExpanded,
  onToggleComments,
  onRefreshComments,
  onEdit,
  onDelete,
  onNotify,
}: PostCardProps) {
  return (
    <article className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700/80 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{authorName}</h3>
            <p className="text-[11px] text-slate-500">
              <FormattedDate dateString={post.created_at} type="datetime" />
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/60 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <h4 className="text-base font-bold text-slate-100">{post.title}</h4>
        {post.content && (
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        )}
        {post.image_url && (
          <div className="rounded-xl overflow-hidden border border-slate-800 max-h-96 bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Footer / Comments Drawer Toggle */}
      <div className="pt-4 border-t border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleComments(post.id)}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>💬</span>
            <span>
              {isCommentsExpanded
                ? "Hide Comments"
                : `View Comments (${comments?.length ?? "..."})`}
            </span>
          </button>
        </div>

        {isCommentsExpanded && (
          <CommentSection
            postId={post.id}
            comments={comments || []}
            users={users}
            onRefreshComments={onRefreshComments}
            onNotify={onNotify}
          />
        )}
      </div>
    </article>
  );
}
