"use client";

import { useEffect, useState } from "react";
import { useAlert } from "@/store/use-alert-store";
import { usePathname } from "next/navigation"; // To detect route changes
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalAlert() {
  const { message, type, isVisible, variant, duration, clear } = useAlert();
  const pathname = usePathname();
  const [progress, setProgress] = useState(100);

  // 1. Clear alert when user navigates to a different page
  useEffect(() => {
    clear();
  }, [pathname, clear]);

  // 2. Timer and Circular Progress logic
  useEffect(() => {
    if (isVisible && variant === "floating") {
      setProgress(100);
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
      }, 10);

      const timer = setTimeout(() => clear(), duration);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isVisible, variant, duration, clear]);

  if (!isVisible || !message) return null;

  const isError = type === "error";
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md border text-sm transition-all duration-200",
        "animate-in fade-in slide-in-from-top-2",
        isError 
          ? "border-destructive/50 bg-destructive/5 text-destructive" 
          : "border-emerald-500/50 bg-emerald-50 text-emerald-700",
        variant === "floating"
          ? "fixed top-4 right-4 w-full max-w-sm shadow-md z-[100]"
          : "relative w-full max-w-md mb-4 mx-auto shadow-sm"
      )}
    >
      {/* Round Progress Bar around Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        {variant === "floating" && (
          <svg className="absolute h-6 w-6 -rotate-90">
            <circle
              cx="12"
              cy="12"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="opacity-20"
            />
            <circle
              cx="12"
              cy="12"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 10ms linear' }}
            />
          </svg>
        )}
        {isError ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
      </div>
      
      <div className="flex-1 font-medium leading-tight">
        {message}
      </div>

      <button onClick={clear} className="ml-auto opacity-50 hover:opacity-100 transition-opacity">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}