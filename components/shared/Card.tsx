
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties; // Added style prop
}

export const Card: React.FC<CardProps> = ({ children, className, title, icon, style }) => {
  const isRootFlexCol = className?.includes('flex-col');
  // If card root is flex-col, its content area needs to be a flex item that can grow,
  // and also a flex container for its own children (like message list and input bar).
  // min-h-0 is important for nested flex layouts to prevent overflow.
  const contentAreaDynamicClass = isRootFlexCol ? 'flex-1 flex flex-col min-h-0' : '';

  return (
    <div 
      className={`bg-white dark:bg-neutral-800 shadow-lg dark:shadow-neutral-900/50 rounded-xl ${className} transition-colors duration-300`}
      style={style} // Applied style prop
    >
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center space-x-2">
          {icon && <span className="text-teal-600 dark:text-teal-400">{icon}</span>}
          <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-200">{title}</h3>
        </div>
      )}
      {/* Apply p-6 to the content area. If the card's root is flex-col, make content area also flex-col, flex-1 and min-h-0. */}
      <div className={`p-6 ${contentAreaDynamicClass}`}>
        {children}
      </div>
    </div>
  );
};