import React from 'react';

export function LotusIcon({ className = 'w-6 h-6', strokeWidth = 1.7 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 28 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Central Petal */}
      <path d="M14 2C12.8 5.8 11.2 9.5 14 17.5C16.8 9.5 15.2 5.8 14 2Z" />
      {/* Inner Left Petal */}
      <path d="M14 17.5C9.5 15.5 7.5 10.5 9 6C11 10.5 13 14.5 14 17.5Z" />
      {/* Inner Right Petal */}
      <path d="M14 17.5C18.5 15.5 20.5 10.5 19 6C17 10.5 15 14.5 14 17.5Z" />
      {/* Outer Left Petal */}
      <path d="M14 18C7.5 17 3.5 13 4 9C7 11.5 11 15 14 18Z" />
      {/* Outer Right Petal */}
      <path d="M14 18C20.5 17 24.5 13 24 9C21 11.5 17 15 14 18Z" />
      {/* Base curve */}
      <path d="M9.5 20C11.5 21.5 16.5 21.5 18.5 20" />
    </svg>
  );
}
