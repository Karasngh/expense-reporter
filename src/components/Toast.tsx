import React from 'react';

interface ToastProps {
  message: string | null;
  icon?: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  icon = 'check_circle',
  isVisible
}) => {
  return (
    <div
      className={`fixed bottom-20 md:bottom-6 right-6 z-[100] transform transition-all duration-300 pointer-events-none flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl text-xs sm:text-sm font-medium ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-95'
      }`}
    >
      <span className="material-symbols-outlined text-teal-400 text-[20px] shrink-0">
        {icon}
      </span>
      <span className="leading-tight">{message}</span>
    </div>
  );
};
