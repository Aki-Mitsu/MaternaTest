'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import { MobileFrame } from '@/components/shared/MobileFrame';
import { Navbar } from '@/components/shared/Navbar';
import { BottomNav } from '@/components/shared/BottomNav';
import { FloatingAiButton } from '@/components/shared/FloatingAiButton';
import { AiAssistantModal } from '@/components/shared/AiAssistantModal';
import { useMaterna } from '@/lib/context/MaternaContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isInitialized, isAuthenticated, profile, syncError, clearSyncError } = useMaterna();

  const needsLogin = isInitialized && !isAuthenticated;
  const needsOnboarding = isInitialized && isAuthenticated && !profile.onboarded;

  useEffect(() => {
    if (needsLogin) router.replace('/login');
    else if (needsOnboarding) router.replace('/onboarding');
  }, [needsLogin, needsOnboarding, router]);

  // Auto-dismiss save errors
  useEffect(() => {
    if (!syncError) return;
    const t = setTimeout(clearSyncError, 6000);
    return () => clearTimeout(t);
  }, [syncError, clearSyncError]);

  return (
    <MobileFrame>
      <Navbar />
      <main className="flex-1 w-full pb-28 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <FloatingAiButton />
      <BottomNav />
      <AiAssistantModal />

      {syncError && (
        <div
          role="alert"
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-sm w-[92%] p-3.5 rounded-2xl bg-[#FFF2F5] border border-[#FAD4DE] text-xs text-[#9E2B4B] shadow-lg flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C93B63]" />
          <span className="flex-1 leading-relaxed">{syncError}</span>
          <button type="button" onClick={clearSyncError} aria-label="Dismiss" className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </MobileFrame>
  );
}
