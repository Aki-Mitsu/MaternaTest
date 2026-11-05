'use client';

import React from 'react';
import { MobileFrame } from '@/components/shared/MobileFrame';
import { Navbar } from '@/components/shared/Navbar';
import { BottomNav } from '@/components/shared/BottomNav';
import { FloatingAiButton } from '@/components/shared/FloatingAiButton';
import { AiAssistantModal } from '@/components/shared/AiAssistantModal';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileFrame>
      <Navbar />
      <main className="flex-1 w-full pb-28 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <FloatingAiButton />
      <BottomNav />
      <AiAssistantModal />
    </MobileFrame>
  );
}
