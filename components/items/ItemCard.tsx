"use client";

import { Item } from "@/types";
import { FormattedDate } from "../ui/FormattedDate";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
}

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg">
      {item.image_url && (
        <div className="h-44 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
              #{item.id}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            <FormattedDate dateString={item.created_at} type="date" />
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(item)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
