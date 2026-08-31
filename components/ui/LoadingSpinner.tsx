interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ label = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  }[size];

  return (
    <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses} border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`}
      />
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
}
