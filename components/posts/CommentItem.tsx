"use client";

import { Comment } from "@/types";
import { FormattedDate } from "../ui/FormattedDate";

interface CommentItemProps {
  comment: Comment;
  authorName: string;
  onDelete: (id: number) => void;
}

export function CommentItem({ comment, authorName, onDelete }: CommentItemProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 text-xs flex items-start justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-300">{authorName}</span>
          <span className="text-[10px] text-slate-500">
            <FormattedDate dateString={comment.created_at} type="time" />
          </span>
        </div>
        <p className="text-slate-200">{comment.message}</p>
      </div>
      <button
        onClick={() => onDelete(comment.id)}
        className="text-slate-500 hover:text-rose-400 text-xs px-1 cursor-pointer transition-colors"
        title="Delete comment"
      >
        ✕
      </button>
    </div>
  );
}
