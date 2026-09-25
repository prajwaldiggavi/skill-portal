import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; fullPage?: boolean }> = ({
  message = 'Loading data...',
  fullPage = false,
}) => {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      <span className="text-xs text-slate-500 dark:text-slate-400">{message}</span>
    </div>
  );
};
