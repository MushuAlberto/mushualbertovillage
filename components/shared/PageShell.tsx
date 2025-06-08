
import React from 'react';

interface PageShellProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({ title, icon, children, actionButton }) => {
  return (
    <div className="flex flex-col h-full space-y-6"> {/* Changed: Make PageShell root a full-height flex column */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          {icon && <span className="text-teal-600 dark:text-teal-400 text-2xl sm:text-3xl">{icon}</span>}
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100">{title}</h2>
        </div>
        {actionButton}
      </div>
      <div className="flex-1 min-h-0">{children}</div> {/* Changed: Make children area grow and handle overflow */}
    </div>
  );
};
