'use client';

import React from 'react';

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#22302A] flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col relative min-h-screen">
        {children}
      </div>
    </div>
  );
}
