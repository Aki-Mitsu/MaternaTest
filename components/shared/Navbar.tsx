'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, User, Home, HeartPulse, Smile, Sparkles, SlidersHorizontal, Moon, Droplets } from 'lucide-react';
import { useMaterna } from '@/lib/context/MaternaContext';
import { calculatePostpartumAge, getMinutesSince } from '@/lib/utils';
import { LotusIcon } from './LotusIcon';

export function Navbar() {
  const { profile, recoveryLog, moodLogs, lastWakeTimestamp, setIsAiChatOpen } = useMaterna();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [clientNowMs, setClientNowMs] = useState<number | undefined>(undefined);

  useEffect(() => {
    setClientNowMs(Date.now());
  }, []);

  const postData = calculatePostpartumAge(profile.baby_birth_date);

  // Hide on auth/onboarding
  if (pathname.startsWith('/onboarding') || pathname.startsWith('/login')) {
    return null;
  }

  const isHome = pathname === '/' || pathname === '';
  const isRecovery = pathname.startsWith('/recovery');
  const isMood = pathname.startsWith('/mood');
  const isProfile = pathname.startsWith('/profile');

  const navLinks = [
    { href: '/', label: 'Journey', icon: Home, active: isHome },
    { href: '/recovery', label: 'Recovery & Nutrition', icon: HeartPulse, active: isRecovery },
    { href: '/mood', label: 'Mood Logs', icon: Smile, active: isMood },
    { href: '/profile', label: 'Profile', icon: User, active: isProfile },
  ];

  // Dynamic Notification Insights
  const wakeWindowMins = postData.recommendedWakeWindowMins || 75;
  const awakeMins = getMinutesSince(lastWakeTimestamp, clientNowMs);
  const remainingNapMins = Math.max(0, wakeWindowMins - awakeMins);
  const todayStr = clientNowMs ? new Date(clientNowMs).toISOString().split('T')[0] : '';
  const hasLoggedMoodToday = todayStr ? moodLogs.some((m) => m.logged_date === todayStr) : false;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F3F7]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 border-b border-[#EFE3EE]/80 transition-all">
      <div className="max-w-6xl mx-auto flex items-center justify-between relative">
        {/* Left: Mother Avatar & Brand Tag */}
        <div className="flex items-center gap-3">
          <Link href="/profile" className="relative group shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#DE9FA8] to-[#FCD9CE] p-0.5 shadow-sm border border-white">
              <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center text-lg select-none">
                🤱
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#78A890] ring-2 ring-white"></span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F3E7F2] text-[#69486F] flex items-center justify-center shadow-2xs">
              <LotusIcon className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-lg tracking-tight text-[#3A223E] leading-none">
                Materna
              </span>
              <span className="text-[10px] font-medium text-[#8F7292] leading-tight">
                Postpartum • Wk {postData.weeks}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar with Berry Rose active pill */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white/80 p-1.5 rounded-full border border-[#EBE0EC] shadow-2xs">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  item.active
                    ? 'bg-[#9E4875] text-white shadow-xs'
                    : 'text-[#7B637E] hover:text-[#381F3C] hover:bg-[#F7EEF6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Ask AI + Notifications + Settings */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAiChatOpen(true)}
            aria-label="Ask Materna AI"
            className="hidden sm:flex items-center gap-1.5 bg-[#69486F] hover:bg-[#57395D] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FADCE8]" />
            <span>Ask AI</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
            className="w-9 h-9 rounded-full bg-white text-[#58395D] flex items-center justify-center hover:bg-[#FDF9FD] transition-colors relative shadow-2xs border border-[#EBE0EC] cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#DE6082] ring-1 ring-white"></span>
          </button>

          <Link
            href="/profile"
            aria-label="Profile and Settings"
            className="w-9 h-9 rounded-full bg-[#F3E7F2] text-[#69486F] flex items-center justify-center hover:bg-[#EBDCE9] transition-colors shadow-2xs border border-[#E8DAE7]"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Link>
        </div>

        {/* Live Sanctuary Reminders Popover */}
        {showNotifications && (
          <div className="absolute right-0 top-13 w-72 bg-white rounded-2xl border border-[#ECE0EC] shadow-xl p-4 space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#F2E8F1]">
              <span className="text-xs font-bold text-[#2A162B]">Sanctuary Pulse</span>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="text-[10px] font-semibold text-[#9E4875] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF4F9] border border-[#EFE2EE] flex items-start gap-2">
                <Moon className="w-3.5 h-3.5 text-[#9E4875] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A162B]">
                    {remainingNapMins > 0
                      ? `${profile.baby_name || 'Leo'}'s Next Nap in ${remainingNapMins}m`
                      : `${profile.baby_name || 'Leo'}'s Nap Window is Due`}
                  </div>
                  <div className="text-[10px] text-[#7D607E]">
                    Wake window target: {wakeWindowMins} mins
                  </div>
                </div>
              </div>

              <Link
                href="/recovery"
                onClick={() => setShowNotifications(false)}
                className="p-2.5 rounded-xl bg-[#FAF4F9] hover:bg-[#F4E9F3] border border-[#EFE2EE] flex items-start gap-2 transition-colors"
              >
                <Droplets className="w-3.5 h-3.5 text-[#9E4875] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A162B]">
                    Hydration: {recoveryLog.water_glasses} / 10 Glasses
                  </div>
                  <div className="text-[10px] text-[#7D607E]">
                    Tap to log water in Recovery Hub
                  </div>
                </div>
              </Link>

              <Link
                href="/mood"
                onClick={() => setShowNotifications(false)}
                className="p-2.5 rounded-xl bg-[#FAF4F9] hover:bg-[#F4E9F3] border border-[#EFE2EE] flex items-start gap-2 transition-colors"
              >
                <Smile className="w-3.5 h-3.5 text-[#9E4875] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#2A162B]">
                    {hasLoggedMoodToday ? 'Today’s Mood Logged ✓' : 'Daily Mood Check-In Pending'}
                  </div>
                  <div className="text-[10px] text-[#7D607E]">
                    {hasLoggedMoodToday ? 'View your 7-day trend' : 'Take 5 seconds to reflect'}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
